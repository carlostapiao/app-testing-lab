import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpHeaders } from '../constants/http-headers.constants';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
    intercept<T>(context: ExecutionContext, next: CallHandler): Observable<T> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        const correlationId = request.headers[HttpHeaders.X_CORRELATION_ID];

        return next.handle().pipe(
            tap(() => {
                if (correlationId) {
                    response.header('X-Correlation-Id', correlationId);
                }
            })
        );
    }
}
