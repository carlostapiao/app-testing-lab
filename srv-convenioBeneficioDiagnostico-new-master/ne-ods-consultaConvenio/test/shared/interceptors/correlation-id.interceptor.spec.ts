import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { HttpHeaders } from '@/shared/constants/http-headers.constants';
import { CorrelationIdInterceptor } from '@/shared/interceptors/correlation-id.interceptor';

describe('CorrelationIdInterceptor', () => {
    let interceptor: CorrelationIdInterceptor;
    let mockExecutionContext: ExecutionContext;
    let mockCallHandler: CallHandler;
    let mockRequest: { headers: Record<string, string> };
    let mockResponse: { header: jest.Mock };

    beforeEach(() => {
        interceptor = new CorrelationIdInterceptor();
        mockRequest = { headers: {} };
        mockResponse = { header: jest.fn() };
        mockExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
                getResponse: () => mockResponse,
            }),
        } as unknown as ExecutionContext;
        mockCallHandler = { handle: () => of('result') } as CallHandler;
    });

    it('debe reenviar el header X-Correlation-Id en la respuesta cuando viene en la request', done => {
        const correlationId = 'corr-123';
        mockRequest.headers[HttpHeaders.X_CORRELATION_ID] = correlationId;

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            next: value => {
                expect(value).toBe('result');
                expect(mockResponse.header).toHaveBeenCalledWith('X-Correlation-Id', correlationId);
                done();
            },
            error: done.fail,
        });
    });

    it('no debe llamar response.header cuando no hay X-Correlation-Id en la request', done => {
        mockRequest.headers = {};

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            next: () => {
                expect(mockResponse.header).not.toHaveBeenCalled();
                done();
            },
            error: done.fail,
        });
    });
});
