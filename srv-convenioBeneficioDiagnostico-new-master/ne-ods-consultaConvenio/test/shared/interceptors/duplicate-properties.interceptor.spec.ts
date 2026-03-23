import { BadRequestException, CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpHeaders } from '@shared/constants/http-headers.constants';
import { of } from 'rxjs';
import { DuplicatePropertiesInterceptor } from '@/shared/interceptors/duplicate-properties.interceptor';

function createMockContext(
    request: {
        method?: string;
        body?: unknown;
        rawBody?: string | Buffer;
        headers?: Record<string, string | string[] | undefined> | null;
        rawHeaders?: string[];
    } = {}
): ExecutionContext {
    return {
        switchToHttp: () => ({
            getRequest: () => ({
                method: request.method ?? 'GET',
                body: request.body !== undefined ? request.body : {},
                rawBody: request.rawBody,
                headers: request.headers !== undefined ? request.headers : {},
                rawHeaders: request.rawHeaders ?? [],
            }),
        }),
    } as unknown as ExecutionContext;
}

describe('DuplicatePropertiesInterceptor', () => {
    let interceptor: DuplicatePropertiesInterceptor;
    let next: CallHandler;

    beforeEach(() => {
        interceptor = new DuplicatePropertiesInterceptor();
        next = { handle: () => of('ok') } as CallHandler;
    });

    it('debe dejar pasar cuando no hay duplicados en body ni headers', done => {
        const ctx = createMockContext({
            method: 'POST',
            body: { filters: {} },
            rawBody: '{"filters":{}}',
            rawHeaders: ['content-type', 'application/json', 'x-correlation-id', 'abc'],
        });
        interceptor.intercept(ctx, next).subscribe({
            next: value => {
                expect(value).toBe('ok');
                done();
            },
        });
    });

    it('debe lanzar BadRequestException cuando hay header duplicado (x-correlation-id dos veces)', () => {
        const ctx = createMockContext({
            method: 'POST',
            body: {},
            rawBody: '{}',
            rawHeaders: ['x-correlation-id', 'v1', 'x-correlation-id', 'v2'],
        });
        expect(() => {
            interceptor.intercept(ctx, next).subscribe();
        }).toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException cuando body tiene clave duplicada en JSON', () => {
        const ctx = createMockContext({
            method: 'POST',
            body: { filters: {} },
            rawBody: '{"filters":{},"filters":{}}',
        });
        expect(() => {
            interceptor.intercept(ctx, next).subscribe();
        }).toThrow(BadRequestException);
    });

    it('debe usar rawBody como Buffer (Buffer.isBuffer) para detectar duplicados en body', () => {
        const rawBody = Buffer.from('{"a":1,"a":2}', 'utf8');
        const ctx = createMockContext({
            method: 'POST',
            body: { a: 2 },
            rawBody,
        });
        expect(() => {
            interceptor.intercept(ctx, next).subscribe();
        }).toThrow(BadRequestException);
    });

    it('debe normalizar headers con valor array (toma primer elemento)', () => {
        const ctx = createMockContext({
            method: 'POST',
            body: { [HttpHeaders.X_CORRELATION_ID.toLowerCase()]: 'value-in-body' },
            rawBody: '{}',
            headers: { [HttpHeaders.X_CORRELATION_ID]: ['first', 'second'] },
        });
        expect(() => {
            interceptor.intercept(ctx, next).subscribe();
        }).toThrow(BadRequestException);
    });

    it('debe detectar body key que coincide con header property (PROPERTY_IN_BODY_AND_HEADERS)', () => {
        const ctx = createMockContext({
            method: 'POST',
            body: { nombreAplicacion: 'app' },
            rawBody: '{"nombreAplicacion":"app"}',
            headers: { [HttpHeaders.NOMBRE_APLICACION]: 'header-app' },
        });
        expect(() => {
            interceptor.intercept(ctx, next).subscribe();
        }).toThrow(BadRequestException);
    });

    it('debe detectar body key presente en headers como no estándar (PROPERTY_IN_HEADERS)', () => {
        const ctx = createMockContext({
            method: 'POST',
            body: { 'x-custom-header': 'v' },
            rawBody: '{"x-custom-header":"v"}',
            headers: { 'x-custom-header': 'v' },
        });
        expect(() => {
            interceptor.intercept(ctx, next).subscribe();
        }).toThrow(BadRequestException);
    });

    it('debe usar body y headers por defecto cuando son null/undefined', () => {
        const ctx = createMockContext({
            method: 'GET',
            body: undefined,
            headers: undefined,
            rawBody: undefined,
            rawHeaders: [],
        });
        interceptor.intercept(ctx, next).subscribe(() => {});
    });

    it('debe detectar clave duplicada con distinta capitalización (Foo y foo)', () => {
        const ctx = createMockContext({
            method: 'POST',
            body: {},
            rawBody: '{"Foo":1,"foo":2}',
        });
        expect(() => interceptor.intercept(ctx, next).subscribe()).toThrow(BadRequestException);
    });

    it('debe usar body y headers por defecto cuando son null (request.body ?? {}, request.headers ?? {})', () => {
        const ctx = createMockContext({
            method: 'GET',
            body: null,
            headers: null,
            rawBody: undefined,
            rawHeaders: [],
        });
        interceptor.intercept(ctx, next).subscribe(() => {});
    });

    it('debe usar getHeaderName con header en map (X-Correlation-Id)', () => {
        const ctx = createMockContext({
            method: 'POST',
            body: { 'x-correlation-id': 'v' },
            rawBody: '{"x-correlation-id":"v"}',
            headers: { [HttpHeaders.X_CORRELATION_ID]: 'cid' },
        });
        expect(() => interceptor.intercept(ctx, next).subscribe()).toThrow(BadRequestException);
    });
});
