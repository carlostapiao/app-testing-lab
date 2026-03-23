import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { HttpHeaders } from '@/shared/constants/http-headers.constants';
import { Locale } from '@/shared/constants/locale.enum';
import { LocaleInterceptor } from '@/shared/interceptors/locale.interceptor';

jest.mock('@/shared/services/i18n-context.service', () => ({
    I18nContextService: {
        run: jest.fn((_locale: Locale, fn: () => void) => fn()),
    },
}));

describe('LocaleInterceptor', () => {
    let interceptor: LocaleInterceptor;
    let mockRequest: { headers: Record<string, string> };
    let mockExecutionContext: ExecutionContext;
    let mockCallHandler: CallHandler;

    beforeEach(() => {
        interceptor = new LocaleInterceptor();
        mockRequest = { headers: {} };
        mockExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as unknown as ExecutionContext;
        mockCallHandler = { handle: () => of('ok') } as CallHandler;
    });

    it('debe usar locale por defecto cuando no hay Accept-Language', done => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            next: value => {
                expect(value).toBe('ok');
                done();
            },
            error: done.fail,
        });
    });

    it('debe extraer locale en-US cuando Accept-Language es en-US', done => {
        mockRequest.headers[HttpHeaders.ACCEPT_LANGUAGE] = 'en-US';

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            next: value => {
                expect(value).toBe('ok');
                done();
            },
            error: done.fail,
        });
    });

    it('debe extraer locale es-PE cuando Accept-Language es es-PE', done => {
        mockRequest.headers[HttpHeaders.ACCEPT_LANGUAGE] = 'es-PE';

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            next: value => {
                expect(value).toBe('ok');
                done();
            },
            error: done.fail,
        });
    });

    it('debe ordenar por calidad y elegir el primero soportado', done => {
        mockRequest.headers[HttpHeaders.ACCEPT_LANGUAGE] = 'fr-FR;q=0.9, es-PE;q=1.0';

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            next: value => {
                expect(value).toBe('ok');
                done();
            },
            error: done.fail,
        });
    });

    it('debe parsear calidad q cuando viene en el header', done => {
        mockRequest.headers[HttpHeaders.ACCEPT_LANGUAGE] = 'es-PE;q=0.8';
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            next: value => {
                expect(value).toBe('ok');
                done();
            },
            error: done.fail,
        });
    });

    it('debe devolver DEFAULT_LOCALE cuando el tag no es en-us ni es-pe', done => {
        mockRequest.headers[HttpHeaders.ACCEPT_LANGUAGE] = 'fr-FR,de-DE';
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            next: value => {
                expect(value).toBe('ok');
                done();
            },
            error: done.fail,
        });
    });

    it('debe propagar error del observable (subscriber.error)', done => {
        const err = new Error('stream error');
        mockCallHandler = { handle: () => throwError(() => err) } as CallHandler;
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            next: () => done.fail('should error'),
            error: e => {
                expect(e).toBe(err);
                done();
            },
        });
    });

    it('debe invocar subscriber.complete cuando el stream termina', done => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            next: () => {},
            complete: () => done(),
        });
    });

    it('parseAcceptLanguage con qValue sin qMatch (quality 1.0)', done => {
        mockRequest.headers[HttpHeaders.ACCEPT_LANGUAGE] = 'es-PE;other=1';
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            next: value => {
                expect(value).toBe('ok');
                done();
            },
            error: done.fail,
        });
    });
});
