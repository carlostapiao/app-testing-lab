import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common';
import { APP_ERROR_RESPONSES, GENERIC_ERROR_MESSAGE_KEY } from '@shared/constants/http-status-code.constants';
import { ILogger } from '@shared/logger/logger.interface';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { HttpHeaders } from '../constants/http-headers.constants';
import { DEFAULT_LOCALE, Locale } from '../constants/locale.enum';
import { LoggerService } from '../logger/logger.service';
import { ERROR_MESSAGE_KEYS, translate } from '../services/translation.service';
import { translateAndFormat } from '../utils/error-message.utils';

type AppErrorResponseKey = 'BAD_REQUEST' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'UNEXPECTED_ERROR';

function getErrorResponseByStatus(status: number): (typeof APP_ERROR_RESPONSES)[AppErrorResponseKey] {
    switch (status) {
        case 400:
            return APP_ERROR_RESPONSES.BAD_REQUEST;
        case 404:
            return APP_ERROR_RESPONSES.NOT_FOUND;
        case 401:
            return APP_ERROR_RESPONSES.UNAUTHORIZED;
        case 403:
            return APP_ERROR_RESPONSES.FORBIDDEN;
        default:
            return APP_ERROR_RESPONSES.UNEXPECTED_ERROR;
    }
}

/** Mensajes literales de librerías/plataforma que se mapean a keys i18n para traducir. */
const KNOWN_MESSAGE_TO_KEY: Record<string, string> = {
    "Body cannot be empty when content-type is set to 'application/json'": ERROR_MESSAGE_KEYS.EMPTY_BODY_DETECTED,
    "Body is not valid JSON but content-type is set to 'application/json'": ERROR_MESSAGE_KEYS.BODY_INVALID_JSON,
};

interface SecurityErrorResponse {
    codigo: string;
    mensaje: string;
    timestamp: string;
}

interface CustomErrorResponse {
    codigo?: string;
    mensaje?: string;
    descripcion?: string;
    detalle?: unknown[];
}

interface ValidationErrorDetailKey {
    campo: string;
    errorKey: string;
    replacements?: Record<string, string | number>;
}

interface ValidationErrorResponse {
    code?: string;
    message?: string;
    description?: string;
    messageKey?: string;
    descriptionKey?: string;
    detail?: unknown[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger: ILogger;

    constructor(private readonly loggerService: LoggerService) {
        this.logger = this.loggerService.withContext(HttpExceptionFilter.name);
    }

    catch(exception: unknown, host: ArgumentsHost) {
        if (exception instanceof HttpException) {
            return this.httpError(exception, host);
        }

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        let status = 500;

        /* c8 ignore start */
        if (exception instanceof Object) {
            if (
                Object.prototype.hasOwnProperty.call(exception, 'message') &&
                Object.prototype.hasOwnProperty.call(exception, 'type')
            ) {
                interface ErrorType {
                    message: string;
                    type: string;
                    status: number;
                }
                const newException = exception as ErrorType;
                if (newException?.status && !Number.isNaN(newException?.status)) {
                    status = newException?.status;
                }
            }
        }
        /* c8 ignore end */

        const err = exception as Error;
        this.logger.error(
            `Error inesperado (no HttpException). Se responde con T_MS_003. ${err?.message ?? String(exception)}`,
            err?.stack
        );

        const locale = this.extractLocaleFromRequest(ctx.getRequest<FastifyRequest>());
        response.status(status).send({
            codigo: APP_ERROR_RESPONSES.UNEXPECTED_ERROR.CODE,
            mensaje: translate(APP_ERROR_RESPONSES.UNEXPECTED_ERROR.MESSAGE_KEY, locale),
            descripcion: translate(APP_ERROR_RESPONSES.UNEXPECTED_ERROR.DESCRIPTION_KEY, locale),
            detalle: [],
        });
    }

    private isSecurityErrorResponse(responseError: unknown): responseError is SecurityErrorResponse {
        if (typeof responseError !== 'object' || responseError === null) {
            return false;
        }
        const error = responseError as SecurityErrorResponse;
        return (
            typeof error.codigo === 'string' &&
            error.codigo.startsWith('F_SEC_') &&
            typeof error.mensaje === 'string' &&
            typeof error.timestamp === 'string'
        );
    }

    private isCustomErrorResponse(responseError: unknown): responseError is CustomErrorResponse {
        if (typeof responseError !== 'object' || responseError === null) {
            return false;
        }
        const error = responseError as CustomErrorResponse;
        return (
            typeof error.codigo === 'string' &&
            typeof error.mensaje === 'string' &&
            typeof error.descripcion === 'string'
        );
    }

    private httpError(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();

        const locale = this.extractLocaleFromRequest(request);

        const responsePayload = exception.getResponse();
        const message = typeof responsePayload === 'string' ? responsePayload : JSON.stringify(responsePayload);
        const correlationId = request.headers[HttpHeaders.X_CORRELATION_ID];
        this.logger.error(`HttpException en HttpExceptionFilter [correlationId=${correlationId}]: ${message}`);

        const status = exception.getStatus();
        const responseError = exception.getResponse();

        if (this.isSecurityErrorResponse(responseError)) {
            response.status(status).send(responseError);
            return;
        }

        if (this.isCustomErrorResponse(responseError)) {
            response.status(status).send(responseError);
            return;
        }

        if (typeof responseError === 'object' && responseError !== null) {
            const errorObj = responseError as
                | ValidationErrorResponse
                | { message?: string | string[]; statusCode?: number };

            /* c8 ignore start */
            if ('code' in errorObj || 'detail' in errorObj) {
                const validationError = errorObj as ValidationErrorResponse;
                const customResponse = this.getCustomResponse(validationError.code);
                const messageKey = validationError.messageKey ?? customResponse?.messageKey;
                const descriptionKey = validationError.descriptionKey ?? customResponse?.descriptionKey;
                if (messageKey != null && descriptionKey != null) {
                    const detalle = this.translateDetailErrors(validationError.detail || [], locale);
                    const codigo = validationError.code ?? customResponse?.codigo ?? this.getCodeByStatus(status);
                    response.status(status).send({
                        codigo,
                        mensaje: translate(messageKey, locale),
                        descripcion: translate(descriptionKey, locale),
                        detalle,
                    });
                    return;
                }
            }
            /* c8 ignore end */

            /* c8 ignore start */
            if ('message' in errorObj && !('code' in errorObj) && !('codigo' in errorObj)) {
                const message = errorObj.message;
                const errorMessage = Array.isArray(message) ? message : [message];

                response.status(status).send({
                    codigo: this.getCodeByStatus(status),
                    mensaje: this.getMessageByStatus(status, locale),
                    descripcion: this.getDescriptionByStatus(status, locale),
                    detalle: errorMessage.map((msg: string) => ({
                        campo: 'general',
                        error: this.translateKnownOrLiteralMessage(msg, locale),
                    })),
                });
                return;
            }
            /* c8 ignore end */
        }

        /* c8 ignore start */
        if (typeof responseError === 'string') {
            response.status(status).send({
                codigo: this.getCodeByStatus(status),
                mensaje: this.getMessageByStatus(status, locale),
                descripcion: this.getDescriptionByStatus(status, locale),
                detalle: [
                    {
                        campo: 'general',
                        error: this.translateKnownOrLiteralMessage(responseError, locale),
                    },
                ],
            });
            return;
        }
        /* c8 ignore end */

        /* c8 ignore next 6 */
        const statusResp = status || 500;
        response.status(statusResp).send({
            codigo: APP_ERROR_RESPONSES.UNEXPECTED_ERROR.CODE,
            mensaje: translate(APP_ERROR_RESPONSES.UNEXPECTED_ERROR.MESSAGE_KEY, locale),
            descripcion: translate(APP_ERROR_RESPONSES.UNEXPECTED_ERROR.DESCRIPTION_KEY, locale),
            detalle: [{ campo: 'general', error: translate(GENERIC_ERROR_MESSAGE_KEY, locale) }],
        });
    }

    /**
     * Si el mensaje es un literal conocido de librerías, traduce por la key i18n; si no, intenta traducir como key o devuelve el literal.
     */
    private translateKnownOrLiteralMessage(message: string, locale: Locale): string {
        const key = KNOWN_MESSAGE_TO_KEY[message];
        if (key) return translate(key, locale);
        return translate(message, locale);
    }

    /**
     * Traduce los mensajes de detalle: soporta formato con keys (errorKey + replacements) o legacy (error como string/key).
     */
    private translateDetailErrors(detail: unknown[], locale: Locale): { campo: string; error: string }[] {
        return detail.map(item => {
            if (item && typeof item === 'object' && 'campo' in item) {
                const typed = item as ValidationErrorDetailKey & { error?: string };
                if ('errorKey' in typed && typeof typed.errorKey === 'string') {
                    const replacements = typed.replacements ?? {};
                    const error = translateAndFormat(typed.errorKey, replacements, locale);
                    return { campo: typed.campo, error };
                }
                if ('error' in typed && typeof typed.error === 'string') {
                    return {
                        campo: typed.campo,
                        error: this.translateKnownOrLiteralMessage(typed.error, locale),
                    };
                }
            }
            return item as { campo: string; error: string };
        });
    }

    /* c8 ignore start */
    private getCustomResponse(
        code: string | undefined
    ): { codigo: string; messageKey: string; descriptionKey: string } | null {
        if (!code) return null;

        const customResponses = { ...APP_ERROR_RESPONSES };
        const keys = Object.keys(customResponses);

        for (const key of keys) {
            const rsp = customResponses[key as keyof typeof customResponses];
            if (rsp?.CODE === code) {
                return {
                    codigo: rsp.CODE,
                    messageKey: rsp.MESSAGE_KEY,
                    descriptionKey: rsp.DESCRIPTION_KEY,
                };
            }
        }

        return null;
    }
    /* c8 ignore end */

    private extractLocaleFromRequest(request: FastifyRequest): Locale {
        const acceptLanguage = request.headers[HttpHeaders.ACCEPT_LANGUAGE];

        if (!acceptLanguage || typeof acceptLanguage !== 'string') return DEFAULT_LOCALE;

        const lang = acceptLanguage.toLowerCase().split(',')[0].trim();

        if (lang === 'en-us') return Locale.ENGLISH_US;
        if (lang === 'es-pe') return Locale.SPANISH_PE;

        return DEFAULT_LOCALE;
    }

    private getCodeByStatus(status: number): string {
        return getErrorResponseByStatus(status).CODE;
    }

    private getMessageByStatus(status: number, locale: Locale): string {
        return translate(getErrorResponseByStatus(status).MESSAGE_KEY, locale);
    }

    private getDescriptionByStatus(status: number, locale: Locale): string {
        return translate(getErrorResponseByStatus(status).DESCRIPTION_KEY, locale);
    }
}
