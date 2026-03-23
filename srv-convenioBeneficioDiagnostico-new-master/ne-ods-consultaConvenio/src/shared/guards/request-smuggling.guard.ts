import { BadRequestException, type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { HttpHeaders } from '../constants/http-headers.constants';
import { ERROR_MESSAGE_KEYS } from '../services/translation.service';

interface RequestWithRawBody extends FastifyRequest {
    rawBody?: Buffer | string;
}

@Injectable()
export class RequestSmugglingGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<RequestWithRawBody>();

        this.validateEmptyPostBody(request);
        this.validateConflictingHeaders(request);
        this.validateTransferEncoding(request);
        this.validateContentLength(request);
        this.validateBodySize(request);
        this.detectEmbeddedHTTP(request);

        return true;
    }

    private validateEmptyPostBody(request: RequestWithRawBody): void {
        if (request.method !== 'POST') return;

        const rawBody = request.rawBody;
        const isEmpty =
            rawBody !== undefined &&
            (Buffer.isBuffer(rawBody) ? rawBody.length === 0 : (rawBody as string).length === 0);

        if (isEmpty) {
            throw new BadRequestException({
                code: 'F_SEC_007',
                messageKey: ERROR_MESSAGE_KEYS.EMPTY_BODY_NOT_ALLOWED,
                descriptionKey: ERROR_MESSAGE_KEYS.EMPTY_BODY_NOT_ALLOWED,
                detail: [
                    {
                        campo: 'body',
                        errorKey: ERROR_MESSAGE_KEYS.EMPTY_BODY_DETECTED,
                    },
                ],
            });
        }
    }

    private validateConflictingHeaders(request: RequestWithRawBody): void {
        const hasContentLength = HttpHeaders.CONTENT_LENGTH in request.headers;
        const hasTransferEncoding = HttpHeaders.TRANSFER_ENCODING in request.headers;

        if (hasContentLength && hasTransferEncoding) {
            throw new BadRequestException({
                code: 'F_SEC_001',
                messageKey: ERROR_MESSAGE_KEYS.CONFLICTING_HEADERS,
                descriptionKey: ERROR_MESSAGE_KEYS.CONFLICTING_HEADERS,
                detail: [
                    {
                        campo: 'headers',
                        errorKey: ERROR_MESSAGE_KEYS.CONFLICTING_HEADERS_DETAIL,
                    },
                ],
            });
        }
    }

    private validateTransferEncoding(request: RequestWithRawBody): void {
        const transferEncoding = request.headers[HttpHeaders.TRANSFER_ENCODING];
        if (!transferEncoding) return;

        const cleanTE = String(transferEncoding).trim().toLowerCase();

        if (cleanTE.includes(',')) {
            throw new BadRequestException({
                code: 'F_SEC_003',
                messageKey: ERROR_MESSAGE_KEYS.TRANSFER_ENCODING_MULTIPLE,
                descriptionKey: ERROR_MESSAGE_KEYS.TRANSFER_ENCODING_MULTIPLE,
                detail: [
                    {
                        campo: 'Transfer-Encoding',
                        errorKey: ERROR_MESSAGE_KEYS.TRANSFER_ENCODING_MULTIPLE_DETAIL,
                        replacements: { value: String(transferEncoding) },
                    },
                ],
            });
        }

        if (!/^[a-z]+$/.test(cleanTE) || cleanTE !== 'chunked') {
            throw new BadRequestException({
                code: 'F_SEC_003',
                messageKey: ERROR_MESSAGE_KEYS.TRANSFER_ENCODING_INVALID_VALUE,
                descriptionKey: ERROR_MESSAGE_KEYS.TRANSFER_ENCODING_INVALID_VALUE,
                detail: [
                    {
                        campo: 'Transfer-Encoding',
                        errorKey: ERROR_MESSAGE_KEYS.TRANSFER_ENCODING_INVALID_VALUE_DETAIL,
                        replacements: { value: String(transferEncoding) },
                    },
                ],
            });
        }
    }

    private validateContentLength(request: RequestWithRawBody): void {
        const contentLength = request.headers[HttpHeaders.CONTENT_LENGTH];
        if (!contentLength) return;

        const cleanCL = String(contentLength).trim();
        const parsedCL = parseInt(cleanCL, 10);

        if (Number.isNaN(parsedCL) || parsedCL < 0) {
            throw new BadRequestException({
                code: 'F_SEC_004',
                messageKey: ERROR_MESSAGE_KEYS.CONTENT_LENGTH_INVALID,
                descriptionKey: ERROR_MESSAGE_KEYS.CONTENT_LENGTH_INVALID,
                detail: [
                    {
                        campo: 'Content-Length',
                        errorKey: ERROR_MESSAGE_KEYS.CONTENT_LENGTH_INVALID_DETAIL,
                        replacements: { value: String(contentLength) },
                    },
                ],
            });
        }

        if (cleanCL.includes(',')) {
            throw new BadRequestException({
                code: 'F_SEC_002',
                messageKey: ERROR_MESSAGE_KEYS.CONTENT_LENGTH_DUPLICATE,
                descriptionKey: ERROR_MESSAGE_KEYS.CONTENT_LENGTH_DUPLICATE,
                detail: [
                    {
                        campo: 'Content-Length',
                        errorKey: ERROR_MESSAGE_KEYS.CONTENT_LENGTH_DUPLICATE_DETAIL,
                        replacements: { value: String(contentLength) },
                    },
                ],
            });
        }
    }

    private validateBodySize(request: RequestWithRawBody): void {
        if (request.method !== 'POST') return;

        const contentLength = request.headers[HttpHeaders.CONTENT_LENGTH];
        if (!contentLength) return;

        const declaredLength = parseInt(String(contentLength), 10);
        let actualBodySize: number;

        /* c8 ignore start - ramas cubiertas: Buffer/string/sin rawBody */
        if (request.rawBody) {
            actualBodySize = Buffer.isBuffer(request.rawBody)
                ? request.rawBody.length
                : Buffer.byteLength(request.rawBody, 'utf8');
        } else {
            const bodyContent = JSON.stringify(request.body || {});
            actualBodySize = Buffer.byteLength(bodyContent, 'utf8');
        }
        /* c8 ignore end */

        const tolerance = 50;

        if (Math.abs(declaredLength - actualBodySize) > tolerance) {
            throw new BadRequestException({
                code: 'F_SEC_005',
                messageKey: ERROR_MESSAGE_KEYS.CONTENT_LENGTH_MISMATCH,
                descriptionKey: ERROR_MESSAGE_KEYS.CONTENT_LENGTH_MISMATCH,
                detail: [
                    {
                        campo: 'Content-Length',
                        errorKey: ERROR_MESSAGE_KEYS.CONTENT_LENGTH_MISMATCH_DETAIL,
                        replacements: {
                            declared: declaredLength.toString(),
                            actual: actualBodySize.toString(),
                        },
                    },
                ],
            });
        }
    }

    private detectEmbeddedHTTP(request: RequestWithRawBody): void {
        if (request.method !== 'POST') return;

        let bodyString: string;
        /* c8 ignore start */
        if (request.rawBody) {
            bodyString = Buffer.isBuffer(request.rawBody) ? request.rawBody.toString('utf8') : request.rawBody;
        } else {
            bodyString = JSON.stringify(request.body || {});
        }
        /* c8 ignore end */

        const suspiciousPatterns = [/GET\s+/, /POST\s+/, /PUT\s+/, /DELETE\s+/, /HTTP\/1\.[01]/i, /\r\n\r\n/];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(bodyString)) {
                throw new BadRequestException({
                    code: 'F_SEC_006',
                    messageKey: ERROR_MESSAGE_KEYS.EMBEDDED_HTTP_REQUEST,
                    descriptionKey: ERROR_MESSAGE_KEYS.EMBEDDED_HTTP_REQUEST,
                    detail: [
                        {
                            campo: 'body',
                            errorKey: ERROR_MESSAGE_KEYS.EMBEDDED_HTTP_REQUEST_DETAIL,
                        },
                    ],
                });
            }
        }
    }
}
