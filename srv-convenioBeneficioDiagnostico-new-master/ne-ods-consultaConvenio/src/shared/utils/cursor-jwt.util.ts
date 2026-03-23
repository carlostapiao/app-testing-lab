import { BadRequestException } from '@nestjs/common';
import { APP_ERROR_RESPONSES } from '@shared/constants/http-status-code.constants';
import * as jwt from 'jsonwebtoken';
import { ERROR_MESSAGE_KEYS } from '../constants/error-messages.constants';

export interface CursorPayload {
    id: string;
    direction: 'next' | 'prev';
    timestamp: number;
}

export class CursorJwtUtil {
    private static readonly DEFAULT_EXPIRATION_SECONDS = 3600;
    private static readonly ALGORITHM = 'HS256';

    static encode(
        id: string,
        direction: 'next' | 'prev',
        secret: string,
        expirationSeconds: number = CursorJwtUtil.DEFAULT_EXPIRATION_SECONDS
    ): string {
        if (!id || !secret) {
            throw new Error('ID and secret are required for cursor encoding');
        }

        const payload: CursorPayload = {
            id,
            direction,
            timestamp: Math.floor(Date.now() / 1000) + expirationSeconds,
        };

        try {
            return jwt.sign(payload, secret, {
                algorithm: CursorJwtUtil.ALGORITHM,
                expiresIn: expirationSeconds,
            });
        } catch (error) {
            throw new Error(`Failed to encode cursor: ${error.message}`);
        }
    }

    static decode(token: string, secret: string): { id: string; direction: 'next' | 'prev' } {
        if (!token || !secret) {
            throw new BadRequestException({
                code: APP_ERROR_RESPONSES.BAD_REQUEST.CODE,
                messageKey: APP_ERROR_RESPONSES.BAD_REQUEST.MESSAGE_KEY,
                descriptionKey: APP_ERROR_RESPONSES.BAD_REQUEST.DESCRIPTION_KEY,
                detail: [{ campo: 'cursor', errorKey: ERROR_MESSAGE_KEYS.CURSOR_REQUIRED }],
            });
        }

        try {
            const decoded = jwt.verify(token, secret, {
                algorithms: [CursorJwtUtil.ALGORITHM],
            }) as CursorPayload;

            if (!decoded.id || !decoded.direction) {
                throw new BadRequestException({
                    code: APP_ERROR_RESPONSES.BAD_REQUEST.CODE,
                    messageKey: APP_ERROR_RESPONSES.BAD_REQUEST.MESSAGE_KEY,
                    descriptionKey: APP_ERROR_RESPONSES.BAD_REQUEST.DESCRIPTION_KEY,
                    detail: [{ campo: 'cursor', errorKey: ERROR_MESSAGE_KEYS.CURSOR_INVALID_DATA }],
                });
            }

            if (decoded.direction !== 'next' && decoded.direction !== 'prev') {
                throw new BadRequestException({
                    code: APP_ERROR_RESPONSES.BAD_REQUEST.CODE,
                    messageKey: APP_ERROR_RESPONSES.BAD_REQUEST.MESSAGE_KEY,
                    descriptionKey: APP_ERROR_RESPONSES.BAD_REQUEST.DESCRIPTION_KEY,
                    detail: [{ campo: 'cursor', errorKey: ERROR_MESSAGE_KEYS.CURSOR_INVALID_DIRECTION }],
                });
            }

            return {
                id: decoded.id,
                direction: decoded.direction,
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            if (error.name === 'TokenExpiredError') {
                throw new BadRequestException({
                    code: APP_ERROR_RESPONSES.BAD_REQUEST.CODE,
                    messageKey: APP_ERROR_RESPONSES.BAD_REQUEST.MESSAGE_KEY,
                    descriptionKey: APP_ERROR_RESPONSES.BAD_REQUEST.DESCRIPTION_KEY,
                    detail: [{ campo: 'cursor', errorKey: ERROR_MESSAGE_KEYS.CURSOR_EXPIRED }],
                });
            }

            if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
                throw new BadRequestException({
                    code: APP_ERROR_RESPONSES.BAD_REQUEST.CODE,
                    messageKey: APP_ERROR_RESPONSES.BAD_REQUEST.MESSAGE_KEY,
                    descriptionKey: APP_ERROR_RESPONSES.BAD_REQUEST.DESCRIPTION_KEY,
                    detail: [{ campo: 'cursor', errorKey: ERROR_MESSAGE_KEYS.CURSOR_TAMPERED }],
                });
            }

            throw new BadRequestException({
                code: APP_ERROR_RESPONSES.BAD_REQUEST.CODE,
                messageKey: APP_ERROR_RESPONSES.BAD_REQUEST.MESSAGE_KEY,
                descriptionKey: APP_ERROR_RESPONSES.BAD_REQUEST.DESCRIPTION_KEY,
                detail: [{ campo: 'cursor', errorKey: ERROR_MESSAGE_KEYS.CURSOR_DECODE_ERROR }],
            });
        }
    }
}
