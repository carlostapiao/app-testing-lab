import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { HttpHeaders } from '@shared/constants/http-headers.constants';
import { RequestSmugglingGuard } from '@/shared/guards/request-smuggling.guard';

function createMockContext(
    overrides: { method?: string; rawBody?: Buffer | string; headers?: Record<string, string>; body?: unknown } = {}
): ExecutionContext {
    const request = {
        method: overrides.method ?? 'GET',
        rawBody: overrides.rawBody,
        headers: overrides.headers ?? {},
        body: overrides.body,
    };
    return {
        switchToHttp: () => ({
            getRequest: () => request,
        }),
    } as unknown as ExecutionContext;
}

describe('RequestSmugglingGuard', () => {
    let guard: RequestSmugglingGuard;

    beforeEach(() => {
        guard = new RequestSmugglingGuard();
    });

    it('debe permitir GET sin body', () => {
        const ctx = createMockContext({ method: 'GET' });
        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('debe rechazar POST con body vacío (rawBody buffer vacío)', () => {
        const ctx = createMockContext({ method: 'POST', rawBody: Buffer.from('') });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe rechazar POST con rawBody string vacío', () => {
        const ctx = createMockContext({ method: 'POST', rawBody: '' });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe permitir POST con rawBody no vacío', () => {
        const ctx = createMockContext({ method: 'POST', rawBody: Buffer.from('{"filters":{}}') });
        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('debe rechazar cuando Content-Length y Transfer-Encoding están presentes', () => {
        const ctx = createMockContext({
            method: 'POST',
            rawBody: Buffer.from('{}'),
            headers: {
                [HttpHeaders.CONTENT_LENGTH]: '2',
                [HttpHeaders.TRANSFER_ENCODING]: 'chunked',
            },
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe rechazar Transfer-Encoding con múltiples valores (coma)', () => {
        const ctx = createMockContext({
            method: 'POST',
            rawBody: Buffer.from('{}'),
            headers: { [HttpHeaders.TRANSFER_ENCODING]: 'chunked, gzip' },
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe rechazar Transfer-Encoding con valor distinto de chunked', () => {
        const ctx = createMockContext({
            method: 'POST',
            rawBody: Buffer.from('{}'),
            headers: { [HttpHeaders.TRANSFER_ENCODING]: 'gzip' },
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe rechazar Content-Length no numérico', () => {
        const ctx = createMockContext({
            method: 'POST',
            rawBody: Buffer.from('{}'),
            headers: { [HttpHeaders.CONTENT_LENGTH]: 'abc' },
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe rechazar body con patrón HTTP embebido (GET)', () => {
        const ctx = createMockContext({
            method: 'POST',
            rawBody: Buffer.from('GET / HTTP/1.0'),
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe rechazar Content-Length con coma (duplicado)', () => {
        const ctx = createMockContext({
            method: 'POST',
            rawBody: Buffer.from('{}'),
            headers: { [HttpHeaders.CONTENT_LENGTH]: '2, 3' },
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe rechazar cuando Content-Length no coincide con tamaño real del body (tolerance 50)', () => {
        const body = '{"filters":{}}';
        const ctx = createMockContext({
            method: 'POST',
            rawBody: Buffer.from(body),
            headers: { [HttpHeaders.CONTENT_LENGTH]: '999' },
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe rechazar body con patrón POST embebido', () => {
        const ctx = createMockContext({
            method: 'POST',
            rawBody: Buffer.from('{"x":"POST /api"}'),
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe rechazar body con HTTP/1.1', () => {
        const ctx = createMockContext({
            method: 'POST',
            rawBody: Buffer.from('x HTTP/1.1 y'),
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe calcular body size desde request.body cuando no hay rawBody', () => {
        const ctx = createMockContext({
            method: 'POST',
            rawBody: undefined,
            headers: { [HttpHeaders.CONTENT_LENGTH]: '999' },
            body: { filters: {} },
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe detectar patrón HTTP embebido cuando body viene de request.body (sin rawBody)', () => {
        const ctx = createMockContext({
            method: 'POST',
            rawBody: undefined,
            body: { data: 'GET / HTTP/1.0' },
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe calcular body size con rawBody como string (no Buffer)', () => {
        const bodyStr = '{"a":1}';
        const ctx = createMockContext({
            method: 'POST',
            rawBody: bodyStr,
            headers: { [HttpHeaders.CONTENT_LENGTH]: String(Buffer.byteLength(bodyStr, 'utf8')) },
        });
        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('debe detectar HTTP embebido cuando rawBody es string con GET', () => {
        const ctx = createMockContext({
            method: 'POST',
            rawBody: 'GET /path HTTP/1.0',
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('debe calcular actualBodySize con rawBody como Buffer (branch Buffer.isBuffer)', () => {
        const buf = Buffer.from('{"a":1}', 'utf8');
        const ctx = createMockContext({
            method: 'POST',
            rawBody: buf,
            headers: { [HttpHeaders.CONTENT_LENGTH]: String(buf.length) },
        });
        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('debe usar bodyString de JSON.stringify cuando no hay rawBody (detectEmbeddedHTTP)', () => {
        const ctx = createMockContext({
            method: 'POST',
            rawBody: undefined,
            body: { text: 'POST /api HTTP/1.0' },
        });
        expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });
});
