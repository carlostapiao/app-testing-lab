import { BadRequestException, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { APP_ERROR_RESPONSES } from '@shared/constants/http-status-code.constants';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { extractValidationErrors } from '../utils/validation.utils';

/** Resuelve headers a DTO validado (exportado para tests). */
export async function resolveRequestHeader(value: new () => object, ctx: ExecutionContext): Promise<object> {
    const headers = ctx.switchToHttp().getRequest().headers;
    const headersDto = plainToInstance(value, headers, {
        excludeExtraneousValues: true,
    });

    const errors = await validate(headersDto);

    if (errors.length > 0) {
        const detail = extractValidationErrors(errors);

        throw new BadRequestException({
            code: APP_ERROR_RESPONSES.BAD_REQUEST.CODE,
            messageKey: APP_ERROR_RESPONSES.BAD_REQUEST.MESSAGE_KEY,
            descriptionKey: APP_ERROR_RESPONSES.BAD_REQUEST.DESCRIPTION_KEY,
            detail,
        });
    }
    return headersDto;
}

export const RequestHeader = createParamDecorator(resolveRequestHeader);
