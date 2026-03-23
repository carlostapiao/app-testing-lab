import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { CorrelationIdInterceptor } from './interceptors/correlation-id.interceptor';
import { LocaleInterceptor } from './interceptors/locale.interceptor';
import { SanitizedValidationPipe } from './pipes/sanitized-validation.pipe';

@Module({
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: LocaleInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: CorrelationIdInterceptor,
        },
        {
            provide: APP_PIPE,
            useClass: SanitizedValidationPipe,
        },
    ],
})
export class SharedModule {}
