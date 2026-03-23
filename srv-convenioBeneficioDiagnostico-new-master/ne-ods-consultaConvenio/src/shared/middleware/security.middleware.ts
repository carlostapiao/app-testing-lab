import { BadRequestException, Injectable, type NestMiddleware } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { HttpHeaders } from '../constants/http-headers.constants';
import type { ILogger } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';
import { ERROR_MESSAGE_KEYS, translate } from '../services/translation.service';
import { translateAndFormat } from '../utils/error-message.utils';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
    private readonly MAX_BODY_SIZE = 1048576;
    private readonly logger: ILogger;

    constructor(private readonly loggerService: LoggerService) {
        this.logger = this.loggerService.withContext(SecurityMiddleware.name);
    }

    use(req: FastifyRequest, _res: FastifyReply, next: (err?: Error) => void) {
        this.logger.debug('Inicio validación de seguridad', {
            method: req.method,
            url: req.url,
            hasContentLength: !!req.headers[HttpHeaders.CONTENT_LENGTH],
            hasTransferEncoding: !!req.headers[HttpHeaders.TRANSFER_ENCODING],
        });

        try {
            this.validateTransferEncoding(req);
            this.logger.debug('Transfer-Encoding: OK');

            this.validateContentLengthSize(req);
            this.logger.debug('Content-Length: OK');

            this.validateHttpHeaders(req);
            this.logger.debug('Headers: OK (sin CRLF/Null)');

            this.logger.debug('Validación de seguridad completada, continuando');
            next();
        } catch (error) {
            this.logger.warn('Validación de seguridad rechazada', {
                method: req.method,
                url: req.url,
                error: error instanceof Error ? error.message : String(error),
                /* c8 ignore next 3 - ramas cubiertas por tests; v8 reporta branch no cubierto */
                code:
                    error instanceof BadRequestException
                        ? (error.getResponse() as { codigo?: string })?.codigo
                        : undefined,
            });
            if (error instanceof BadRequestException) throw error;
            throw new BadRequestException({
                codigo: 'F_SEC_999',
                mensaje: translate(ERROR_MESSAGE_KEYS.SECURITY_VALIDATION_ERROR),
                descripcion: translate(ERROR_MESSAGE_KEYS.SECURITY_VALIDATION_ERROR),
                detalle: [
                    {
                        campo: 'security',
                        error: error.message || translate(ERROR_MESSAGE_KEYS.UNEXPECTED_ERROR_MESSAGE),
                    },
                ],
                timestamp: new Date().toISOString(),
            });
        }
    }

    private validateTransferEncoding(req: FastifyRequest): void {
        if (req.headers[HttpHeaders.TRANSFER_ENCODING]) {
            throw new BadRequestException({
                codigo: 'F_SEC_003',
                mensaje: translate(ERROR_MESSAGE_KEYS.TRANSFER_ENCODING_NOT_ALLOWED),
                descripcion: translate(ERROR_MESSAGE_KEYS.TRANSFER_ENCODING_NOT_ALLOWED),
                detalle: [
                    {
                        campo: 'Transfer-Encoding',
                        error: translateAndFormat(ERROR_MESSAGE_KEYS.TRANSFER_ENCODING_BLOCKED_DETAIL, {
                            value: String(req.headers[HttpHeaders.TRANSFER_ENCODING]),
                        }),
                    },
                ],
                timestamp: new Date().toISOString(),
            });
        }
    }

    private validateContentLengthSize(req: FastifyRequest): void {
        const contentLength = req.headers[HttpHeaders.CONTENT_LENGTH];
        if (!contentLength) return;

        const size = parseInt(String(contentLength), 10);
        if (Number.isNaN(size)) {
            throw new BadRequestException({
                codigo: 'F_SEC_004',
                mensaje: translate(ERROR_MESSAGE_KEYS.CONTENT_LENGTH_INVALID),
                descripcion: translate(ERROR_MESSAGE_KEYS.CONTENT_LENGTH_INVALID),
                detalle: [
                    {
                        campo: 'Content-Length',
                        error: translateAndFormat(ERROR_MESSAGE_KEYS.CONTENT_LENGTH_INVALID_DETAIL, {
                            value: String(contentLength),
                        }),
                    },
                ],
                timestamp: new Date().toISOString(),
            });
        }

        if (size < 0) {
            throw new BadRequestException({
                codigo: 'F_SEC_004',
                mensaje: translate(ERROR_MESSAGE_KEYS.CONTENT_LENGTH_NEGATIVE),
                descripcion: translate(ERROR_MESSAGE_KEYS.CONTENT_LENGTH_NEGATIVE),
                detalle: [
                    {
                        campo: 'Content-Length',
                        error: translateAndFormat(ERROR_MESSAGE_KEYS.CONTENT_LENGTH_NEGATIVE_DETAIL, {
                            value: String(contentLength),
                        }),
                    },
                ],
                timestamp: new Date().toISOString(),
            });
        }

        if (size > this.MAX_BODY_SIZE) {
            throw new BadRequestException({
                codigo: 'F_SEC_008',
                mensaje: translate(ERROR_MESSAGE_KEYS.PAYLOAD_EXCEEDS_LIMIT),
                descripcion: `${translate(ERROR_MESSAGE_KEYS.PAYLOAD_EXCEEDS_LIMIT)} (${this.MAX_BODY_SIZE} bytes / 1MB)`,
                detalle: [
                    {
                        campo: 'Content-Length',
                        error: translateAndFormat(ERROR_MESSAGE_KEYS.CONTENT_LENGTH_EXCEEDS_LIMIT_DETAIL, {
                            received: size.toString(),
                            max: this.MAX_BODY_SIZE.toString(),
                        }),
                    },
                ],
                timestamp: new Date().toISOString(),
            });
        }
    }

    private validateHttpHeaders(req: FastifyRequest): void {
        const dangerousPatterns = ['\r', '\n', '\0'];
        for (const [headerName, headerValue] of Object.entries(req.headers)) {
            if (!headerValue) continue;
            const value = String(headerValue);
            for (const pattern of dangerousPatterns) {
                if (value.includes(pattern)) {
                    throw new BadRequestException({
                        codigo: 'F_SEC_009',
                        mensaje: translate(ERROR_MESSAGE_KEYS.INVALID_HTTP_HEADER),
                        descripcion: translate(ERROR_MESSAGE_KEYS.INVALID_HTTP_HEADER),
                        detalle: [{ campo: headerName, error: translate(ERROR_MESSAGE_KEYS.CRLF_INJECTION_DETAIL) }],
                        timestamp: new Date().toISOString(),
                    });
                }
            }
        }
    }
}
