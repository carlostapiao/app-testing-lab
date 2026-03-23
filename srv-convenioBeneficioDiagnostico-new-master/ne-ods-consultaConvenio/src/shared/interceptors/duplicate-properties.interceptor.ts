import {
    BadRequestException,
    type CallHandler,
    type ExecutionContext,
    Injectable,
    type NestInterceptor,
} from '@nestjs/common';
import { APP_ERROR_RESPONSES } from '@shared/constants/http-status-code.constants';
import type { Observable } from 'rxjs';
import { HttpHeaders } from '../constants/http-headers.constants';
import { ERROR_MESSAGE_KEYS } from '../services/translation.service';
import { getFromMap } from '../utils/safe-get.util';
import { truncateString } from '../utils/string.utils';
import type { ValidationErrorDetailKey } from '../utils/validation.utils';

interface RequestWithRawHeaders {
    rawHeaders?: string[];
    headers?: Record<string, string | string[] | undefined>;
    method?: string;
    body?: unknown;
    rawBody?: Buffer | string;
}

@Injectable()
export class DuplicatePropertiesInterceptor implements NestInterceptor {
    private readonly headerProperties = [
        HttpHeaders.X_CORRELATION_ID,
        HttpHeaders.X_REQUEST_ID,
        HttpHeaders.NOMBRE_APLICACION,
        HttpHeaders.PROCESO_NEGOCIO,
        HttpHeaders.USUARIO_APLICACION,
        HttpHeaders.OCP_APIM_SUBSCRIPTION_KEY,
    ];

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<RequestWithRawHeaders>();
        const body = (request.body ?? {}) as Record<string, unknown>;
        const headers = (request.headers ?? {}) as Record<string, string | string[] | undefined>;
        const rawBodyRaw = request.rawBody;
        const rawBody =
            typeof rawBodyRaw === 'string'
                ? rawBodyRaw
                : Buffer.isBuffer(rawBodyRaw)
                  ? rawBodyRaw.toString('utf8')
                  : undefined;

        const duplicates: ValidationErrorDetailKey[] = [];

        if (rawBody && request.method === 'POST') {
            const bodyDuplicates = this.detectDuplicateKeysInJson(rawBody);
            duplicates.push(...bodyDuplicates);
        }

        const headerDuplicates = this.detectDuplicateHeaders(request);
        duplicates.push(...headerDuplicates);

        const crossDuplicates = this.detectCrossDuplicates(body, headers);
        duplicates.push(...crossDuplicates);

        if (duplicates.length > 0) {
            throw new BadRequestException({
                code: APP_ERROR_RESPONSES.BAD_REQUEST.CODE,
                messageKey: APP_ERROR_RESPONSES.BAD_REQUEST.MESSAGE_KEY,
                descriptionKey: ERROR_MESSAGE_KEYS.DUPLICATE_PROPERTIES_DETECTED,
                detail: duplicates,
            });
        }

        return next.handle();
    }

    private detectDuplicateKeysInJson(jsonString: string): ValidationErrorDetailKey[] {
        const duplicates: ValidationErrorDetailKey[] = [];

        try {
            const keyPattern = /"([^"]+)":/g;
            const keys: string[] = [];
            const keyPositions: Map<string, number[]> = new Map();

            let match: RegExpExecArray | null = keyPattern.exec(jsonString);
            while (match !== null) {
                const key = match[1];
                const position = match.index;

                /* c8 ignore start */
                if (!keyPositions.has(key)) {
                    keyPositions.set(key, []);
                }
                keyPositions.get(key)?.push(position);
                /* c8 ignore end */
                keys.push(key);
                match = keyPattern.exec(jsonString);
            }

            const normalizedKeys = new Map<string, string[]>();
            keyPositions.forEach((_positions, key) => {
                const normalized = key.toLowerCase();
                /* c8 ignore start */
                if (!normalizedKeys.has(normalized)) {
                    normalizedKeys.set(normalized, []);
                }
                normalizedKeys.get(normalized)?.push(key);
                /* c8 ignore end */
            });

            normalizedKeys.forEach((originalKeys, _normalizedKey) => {
                const allPositions: number[] = [];
                originalKeys.forEach(originalKey => {
                    /* c8 ignore next */
                    const positions = keyPositions.get(originalKey) || [];
                    allPositions.push(...positions);
                });

                if (allPositions.length > 1) {
                    const truncatedField = truncateString(originalKeys[0]);
                    duplicates.push({
                        campo: truncatedField,
                        errorKey: ERROR_MESSAGE_KEYS.PROPERTY_DUPLICATED_IN_BODY,
                        replacements: {
                            field: truncatedField,
                            count: allPositions.length,
                        },
                    });
                }
            });
        } catch (_error) {}

        return duplicates;
    }

    private detectDuplicateHeaders(request: RequestWithRawHeaders): ValidationErrorDetailKey[] {
        const duplicates: ValidationErrorDetailKey[] = [];

        const rawHeaders = request.rawHeaders ?? [];
        const headerCounts = new Map<string, number>();
        const headerNames = new Map<string, string>();

        for (let i = 0; i < rawHeaders.length; i += 2) {
            const headerName = rawHeaders[i];
            const normalizedName = headerName.toLowerCase();

            if (!headerCounts.has(normalizedName)) {
                headerCounts.set(normalizedName, 0);
                headerNames.set(normalizedName, headerName);
            }
            headerCounts.set(normalizedName, getFromMap(headerCounts, normalizedName, 0) + 1);
        }

        headerCounts.forEach((count, normalizedName) => {
            const headerValues = this.headerProperties.map(h => h.toLowerCase());
            if (count > 1 && headerValues.includes(normalizedName.toLowerCase())) {
                /* c8 ignore next */
                const originalName = headerNames.get(normalizedName) || normalizedName;
                const truncatedField = truncateString(originalName);
                duplicates.push({
                    campo: truncatedField,
                    errorKey: ERROR_MESSAGE_KEYS.HEADER_DUPLICATED,
                    replacements: {
                        field: truncatedField,
                        count,
                    },
                });
            }
        });

        return duplicates;
    }

    private detectCrossDuplicates(
        body: Record<string, unknown>,
        headers: Record<string, string | string[] | undefined>
    ): ValidationErrorDetailKey[] {
        const duplicates: ValidationErrorDetailKey[] = [];

        const normalizedHeaders: Record<string, string> = {};
        for (const key of Object.keys(headers)) {
            const v = headers[key];
            /* c8 ignore next */
            normalizedHeaders[key.toLowerCase()] = Array.isArray(v) ? v[0] : ((v as string) ?? '');
        }

        const bodyKeys = Object.keys(body);
        const normalizedBodyKeys = bodyKeys.map(k => k.toLowerCase());

        for (const headerProp of this.headerProperties) {
            const matchingBodyKey = bodyKeys.find(
                (_key, index) => normalizedBodyKeys[index] === headerProp.toLowerCase()
            );

            if (matchingBodyKey) {
                const truncatedField = truncateString(matchingBodyKey);
                duplicates.push({
                    campo: truncatedField,
                    errorKey: ERROR_MESSAGE_KEYS.PROPERTY_IN_BODY_AND_HEADERS,
                    replacements: {
                        field: truncatedField,
                        header: this.getHeaderName(headerProp),
                    },
                });
            }
        }

        for (const bodyKey of bodyKeys) {
            const normalizedBodyKey = bodyKey.toLowerCase();

            const headerValues = this.headerProperties.map(h => h.toLowerCase());
            if (
                normalizedHeaders[normalizedBodyKey] &&
                !this.isStandardHttpHeader(normalizedBodyKey) &&
                !headerValues.includes(normalizedBodyKey.toLowerCase())
            ) {
                const truncatedField = truncateString(bodyKey);
                duplicates.push({
                    campo: truncatedField,
                    errorKey: ERROR_MESSAGE_KEYS.PROPERTY_IN_HEADERS,
                    replacements: {
                        field: truncatedField,
                    },
                });
            }
        }

        return duplicates;
    }

    private getHeaderName(normalizedName: string): string {
        const headerDisplayMap: Record<string, string> = {
            [HttpHeaders.X_CORRELATION_ID]: 'X-Correlation-Id',
            [HttpHeaders.X_REQUEST_ID]: 'X-Request-Id',
            [HttpHeaders.NOMBRE_APLICACION]: 'nombreAplicacion',
            [HttpHeaders.PROCESO_NEGOCIO]: 'procesoNegocio',
            [HttpHeaders.USUARIO_APLICACION]: 'usuarioAplicacion',
            [HttpHeaders.OCP_APIM_SUBSCRIPTION_KEY]: 'ocp-apim-subscription-key',
        };
        /* c8 ignore next */
        return headerDisplayMap[normalizedName.toLowerCase()] || normalizedName;
    }

    private isStandardHttpHeader(name: string): boolean {
        const standardHeaders: string[] = [
            HttpHeaders.CONTENT_TYPE,
            HttpHeaders.ACCEPT,
            HttpHeaders.CONTENT_LENGTH,
            HttpHeaders.ACCEPT_LANGUAGE,
            HttpHeaders.AUTHORIZATION,
            HttpHeaders.USER_AGENT,
            HttpHeaders.HOST,
            HttpHeaders.CONNECTION,
            HttpHeaders.CACHE_CONTROL,
            HttpHeaders.ACCEPT_ENCODING,
            HttpHeaders.ORIGIN,
            HttpHeaders.REFERER,
            HttpHeaders.COOKIE,
            HttpHeaders.SET_COOKIE,
        ];
        return standardHeaders.includes(name.toLowerCase());
    }
}
