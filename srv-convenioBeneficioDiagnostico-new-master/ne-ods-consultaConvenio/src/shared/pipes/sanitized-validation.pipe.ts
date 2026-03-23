import {
    type ArgumentMetadata,
    BadRequestException,
    Injectable,
    type ValidationError,
    ValidationPipe,
} from '@nestjs/common';
import { APP_ERROR_RESPONSES } from '@shared/constants/http-status-code.constants';
import { extractValidationErrors } from '../utils/validation.utils';
import { SanitizationPipe } from './sanitization.pipe';

@Injectable()
export class SanitizedValidationPipe extends ValidationPipe {
    public readonly sanitizationPipe = new SanitizationPipe();

    constructor() {
        super({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            validationError: { target: false, value: false },
            exceptionFactory: (errors: ValidationError[]) => {
                const detail = extractValidationErrors(errors);
                return new BadRequestException({
                    code: APP_ERROR_RESPONSES.BAD_REQUEST.CODE,
                    messageKey: APP_ERROR_RESPONSES.BAD_REQUEST.MESSAGE_KEY,
                    descriptionKey: APP_ERROR_RESPONSES.BAD_REQUEST.DESCRIPTION_KEY,
                    detail,
                });
            },
        });
    }

    async transform(value: unknown, metadata: ArgumentMetadata) {
        try {
            const sanitizedValue = this.sanitizationPipe.transform(value);

            return await super.transform(sanitizedValue, metadata);
        } catch (err) {
            if (err instanceof BadRequestException) {
                throw err;
            }

            const errorDetail = err instanceof Error ? err.message : 'Error durante la sanitización y validación';
            throw new BadRequestException({
                code: APP_ERROR_RESPONSES.BAD_REQUEST.CODE,
                messageKey: APP_ERROR_RESPONSES.BAD_REQUEST.MESSAGE_KEY,
                descriptionKey: APP_ERROR_RESPONSES.BAD_REQUEST.DESCRIPTION_KEY,
                detail: [
                    {
                        campo: 'general',
                        error: errorDetail,
                    },
                ],
            });
        }
    }
}
