import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from '@shared/logger/logger.service';
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter';

function createMockHost(
    response: { status: jest.Mock; send: jest.Mock },
    request?: { headers?: Record<string, string> }
): ArgumentsHost {
    return {
        switchToHttp: () => ({
            getResponse: () => response,
            getRequest: () => ({ headers: request?.headers ?? {} }),
        }),
    } as unknown as ArgumentsHost;
}

describe('HttpExceptionFilter', () => {
    let filter: HttpExceptionFilter;
    let mockLogger: { withContext: jest.Mock; error: jest.Mock };
    let res: { status: jest.Mock; send: jest.Mock };

    beforeEach(() => {
        mockLogger = { withContext: jest.fn().mockReturnThis(), error: jest.fn() };
        res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        filter = new HttpExceptionFilter(mockLogger as unknown as LoggerService);
    });

    it('debe enviar respuesta con código y mensaje para HttpException con objeto de respuesta', () => {
        const exception = new HttpException(
            { code: 'F_NEG_001', messageKey: 'key', descriptionKey: 'desc', detail: [] },
            HttpStatus.BAD_REQUEST
        );
        const host = createMockHost(res);

        filter.catch(exception, host);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                codigo: expect.any(String),
                mensaje: expect.any(String),
                descripcion: expect.any(String),
                detalle: [],
            })
        );
    });

    it('debe reenviar SecurityErrorResponse sin modificar (F_SEC_)', () => {
        const securityPayload = {
            codigo: 'F_SEC_007',
            mensaje: 'Empty body',
            timestamp: new Date().toISOString(),
        };
        const exception = new HttpException(securityPayload, HttpStatus.BAD_REQUEST);
        const host = createMockHost(res);

        filter.catch(exception, host);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith(securityPayload);
    });

    it('debe manejar excepción no HttpException y responder 500', () => {
        const host = createMockHost(res);
        filter.catch(new Error('Unexpected'), host);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                codigo: expect.any(String),
                mensaje: expect.any(String),
                descripcion: expect.any(String),
                detalle: [],
            })
        );
    });

    it('debe usar status del error cuando exception tiene message, type y status', () => {
        const host = createMockHost(res);
        const err = Object.assign(new Error('Custom'), { type: 'CustomError', status: 404 });
        filter.catch(err, host);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe enviar respuesta cuando HttpException.getResponse() es string', () => {
        const exception = new HttpException('Mensaje literal', HttpStatus.BAD_REQUEST);
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({ codigo: expect.any(String), detalle: expect.any(Array) })
        );
    });

    it('debe traducir detail con errorKey y replacements', () => {
        const exception = new HttpException(
            {
                code: 'F_NEG_001',
                messageKey: 'key',
                descriptionKey: 'desc',
                detail: [
                    { campo: 'filters', errorKey: 'validation.field_required', replacements: { field: 'filters' } },
                ],
            },
            HttpStatus.BAD_REQUEST
        );
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ detalle: expect.any(Array) }));
    });

    it('debe usar locale de Accept-Language cuando está presente', () => {
        const exception = new HttpException(
            { code: 'F_NEG_001', messageKey: 'key', descriptionKey: 'desc', detail: [] },
            HttpStatus.BAD_REQUEST
        );
        const host = createMockHost(res, { headers: { 'accept-language': 'es-PE' } });
        filter.catch(exception, host);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debe usar getCodeByStatus para 404 (NOT_FOUND)', () => {
        const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ codigo: expect.any(String) }));
    });

    it('debe usar getCodeByStatus para 401 (UNAUTHORIZED)', () => {
        const exception = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('debe usar getCodeByStatus para 403 (FORBIDDEN)', () => {
        const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('debe traducir detail con error como string (legacy)', () => {
        const exception = new HttpException(
            {
                code: 'F_NEG_001',
                messageKey: 'key',
                descriptionKey: 'desc',
                detail: [{ campo: 'x', error: 'validation.field_required' }],
            },
            HttpStatus.BAD_REQUEST
        );
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ detalle: expect.any(Array) }));
    });

    it('debe manejar response con message array (class-validator)', () => {
        const exception = new HttpException({ message: ['error1', 'error2'], statusCode: 400 }, HttpStatus.BAD_REQUEST);
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ detalle: expect.any(Array) }));
    });

    it('debe usar locale en-us cuando Accept-Language es en-us', () => {
        const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST);
        const host = createMockHost(res, { headers: { 'accept-language': 'en-US' } });
        filter.catch(exception, host);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debe usar UNEXPECTED_ERROR para status 500 (default en getErrorResponseByStatus)', () => {
        const exception = new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({ codigo: expect.any(String), detalle: expect.any(Array) })
        );
    });

    it('debe reenviar CustomErrorResponse cuando tiene codigo, mensaje y descripcion (sin timestamp)', () => {
        const customPayload = { codigo: 'CUSTOM', mensaje: 'Msg', descripcion: 'Desc' };
        const exception = new HttpException(customPayload, HttpStatus.BAD_REQUEST);
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.send).toHaveBeenCalledWith(customPayload);
    });

    it('debe enviar fallback UNEXPECTED cuando response tiene code pero sin messageKey/descriptionKey', () => {
        const exception = new HttpException({ code: 'UNKNOWN_CODE', detail: [] }, HttpStatus.BAD_REQUEST);
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({ codigo: expect.any(String), detalle: expect.any(Array) })
        );
    });

    it('debe enviar fallback cuando tiene messageKey pero descriptionKey es null (rama 169 false)', () => {
        const exception = new HttpException(
            { code: 'UNKNOWN', messageKey: 'some.key', detail: [] },
            HttpStatus.BAD_REQUEST
        );
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ codigo: expect.any(String) }));
    });

    it('debe traducir mensaje conocido de librerías (KNOWN_MESSAGE_TO_KEY)', () => {
        const knownMsg = "Body cannot be empty when content-type is set to 'application/json'";
        const exception = new HttpException(knownMsg, HttpStatus.BAD_REQUEST);
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ detalle: expect.any(Array) }));
    });

    it('translateDetailErrors debe devolver item sin modificar cuando no tiene campo/errorKey/error', () => {
        type CustomDetail = { campo: string; other: number };
        const exception = new HttpException(
            {
                code: 'F_NEG_001',
                messageKey: 'key',
                descriptionKey: 'desc',
                detail: [{ campo: 'x', errorKey: 'key', replacements: {} }, { campo: 'y', other: 1 } as CustomDetail],
            },
            HttpStatus.BAD_REQUEST
        );
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.send).toHaveBeenCalled();
    });

    it('debe usar DEFAULT_LOCALE cuando Accept-Language no es en-us ni es-pe', () => {
        const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);
        const host = createMockHost(res, { headers: { 'accept-language': 'fr-FR' } });
        filter.catch(exception, host);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debe mantener status 500 cuando exception tiene message/type pero status es NaN', () => {
        const host = createMockHost(res);
        const err = Object.assign(new Error('x'), { type: 'X', status: Number.NaN });
        filter.catch(err, host);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('debe mantener status 500 cuando exception tiene message/type pero sin status', () => {
        const host = createMockHost(res);
        const err = Object.assign(new Error('x'), { type: 'X' });
        filter.catch(err, host);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('debe mantener status 500 cuando exception tiene message/type pero status es 0', () => {
        const host = createMockHost(res);
        const err = Object.assign(new Error('x'), { type: 'X', status: 0 });
        filter.catch(err, host);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('debe usar err?.message ?? String(exception) cuando exception no es Error', () => {
        const host = createMockHost(res);
        filter.catch({ message: 'custom', type: 'Custom' }, host);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('custom'), undefined);
    });

    it('debe manejar response con message como string (no array)', () => {
        const exception = new HttpException(
            { message: 'single error message', statusCode: 400 },
            HttpStatus.BAD_REQUEST
        );
        const host = createMockHost(res);
        filter.catch(exception, host);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                detalle: expect.arrayContaining([
                    expect.objectContaining({ campo: 'general', error: expect.any(String) }),
                ]),
            })
        );
    });

    it('debe usar extractLocale cuando accept-language no es string', () => {
        const host = createMockHost(res, {
            headers: { 'accept-language': ['en-US', 'es-PE'] as unknown as string },
        });
        const exception = new HttpException('Bad', HttpStatus.BAD_REQUEST);
        filter.catch(exception, host);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
