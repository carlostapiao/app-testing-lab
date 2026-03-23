import { BadRequestException } from '@nestjs/common';
import { LoggerService } from '@shared/logger/logger.service';
import { HttpHeaders } from '@/shared/constants/http-headers.constants';
import { SecurityMiddleware } from '@/shared/middleware/security.middleware';

jest.mock('@/shared/services/translation.service', () => ({
    translate: jest.fn((key: string) => key),
    ERROR_MESSAGE_KEYS: {},
}));
jest.mock('@/shared/utils/error-message.utils', () => ({
    translateAndFormat: jest.fn((key: string) => key),
}));

describe('SecurityMiddleware', () => {
    let middleware: SecurityMiddleware;
    let mockLogger: { withContext: jest.Mock; debug: jest.Mock; warn: jest.Mock };
    let mockReq: { method: string; url: string; headers: Record<string, string> };
    let mockRes: object;
    let nextFn: (err?: Error) => void;

    beforeEach(() => {
        mockLogger = {
            withContext: jest.fn().mockReturnThis(),
            debug: jest.fn(),
            warn: jest.fn(),
        };
        middleware = new SecurityMiddleware(mockLogger as unknown as LoggerService);
        mockReq = {
            method: 'POST',
            url: '/api/test',
            headers: {},
        };
        mockRes = {};
        nextFn = jest.fn();
    });

    it('debe llamar next() cuando no hay Transfer-Encoding ni Content-Length problemático', () => {
        middleware.use(mockReq as never, mockRes as never, nextFn);
        expect(nextFn).toHaveBeenCalledWith();
    });

    it('debe rechazar con BadRequestException cuando hay header Transfer-Encoding', () => {
        mockReq.headers[HttpHeaders.TRANSFER_ENCODING] = 'chunked';
        expect(() => middleware.use(mockReq as never, mockRes as never, nextFn)).toThrow(BadRequestException);
        expect(nextFn).not.toHaveBeenCalled();
    });

    it('debe rechazar cuando Content-Length no es un número válido', () => {
        mockReq.headers[HttpHeaders.CONTENT_LENGTH] = 'not-a-number';
        expect(() => middleware.use(mockReq as never, mockRes as never, nextFn)).toThrow(BadRequestException);
    });

    it('debe rechazar cuando Content-Length es negativo', () => {
        mockReq.headers[HttpHeaders.CONTENT_LENGTH] = '-1';
        expect(() => middleware.use(mockReq as never, mockRes as never, nextFn)).toThrow(BadRequestException);
    });

    it('debe rechazar cuando Content-Length excede 1MB', () => {
        mockReq.headers[HttpHeaders.CONTENT_LENGTH] = '1048577';
        expect(() => middleware.use(mockReq as never, mockRes as never, nextFn)).toThrow(BadRequestException);
    });

    it('debe rechazar cuando un header contiene CRLF', () => {
        mockReq.headers['x-custom'] = 'value\r\ninjection';
        expect(() => middleware.use(mockReq as never, mockRes as never, nextFn)).toThrow(BadRequestException);
    });

    it('debe ignorar headers con valor vacío y validar el resto', () => {
        mockReq.headers['x-empty'] = '';
        mockReq.headers['x-cr'] = 'val\rue';
        expect(() => middleware.use(mockReq as never, mockRes as never, nextFn)).toThrow(BadRequestException);
    });

    it('debe aceptar Content-Length válido dentro del límite', () => {
        mockReq.headers[HttpHeaders.CONTENT_LENGTH] = '100';
        middleware.use(mockReq as never, mockRes as never, nextFn);
        expect(nextFn).toHaveBeenCalledWith();
    });

    it('debe envolver error no BadRequestException en BadRequestException F_SEC_999', () => {
        const middlewareWithThrow = new SecurityMiddleware(mockLogger as unknown as LoggerService);
        (middlewareWithThrow as unknown as { validateHttpHeaders: () => void }).validateHttpHeaders = () => {
            throw new Error('Unexpected');
        };
        expect(() => middlewareWithThrow.use(mockReq as never, mockRes as never, nextFn)).toThrow(BadRequestException);
        expect(mockLogger.warn).toHaveBeenCalledWith('Validación de seguridad rechazada', expect.any(Object));
    });

    it('debe reenviar BadRequestException sin envolver (codigo en warn)', () => {
        (middleware as unknown as { validateTransferEncoding: () => void }).validateTransferEncoding = () => {
            throw new BadRequestException({
                codigo: 'F_SEC_003',
                mensaje: 'msg',
                descripcion: 'desc',
                timestamp: new Date().toISOString(),
            });
        };
        expect(() => middleware.use(mockReq as never, mockRes as never, nextFn)).toThrow(BadRequestException);
        expect(mockLogger.warn).toHaveBeenCalledWith(
            'Validación de seguridad rechazada',
            expect.objectContaining({ code: 'F_SEC_003' })
        );
    });

    it('warn debe recibir code undefined cuando BadRequestException.getResponse() no tiene codigo', () => {
        (middleware as unknown as { validateHttpHeaders: () => void }).validateHttpHeaders = () => {
            throw new BadRequestException('plain message');
        };
        expect(() => middleware.use(mockReq as never, mockRes as never, nextFn)).toThrow(BadRequestException);
        expect(mockLogger.warn).toHaveBeenCalledWith(
            'Validación de seguridad rechazada',
            expect.objectContaining({ code: undefined })
        );
    });

    it('debe usar String(error) en detalle cuando el error no es instancia de Error', () => {
        (middleware as unknown as { validateHttpHeaders: () => void }).validateHttpHeaders = () => {
            throw 'string error';
        };
        expect(() => middleware.use(mockReq as never, mockRes as never, nextFn)).toThrow(BadRequestException);
    });

    it('debe usar translate(UNEXPECTED_ERROR_MESSAGE) cuando error.message es falsy', () => {
        (middleware as unknown as { validateHttpHeaders: () => void }).validateHttpHeaders = () => {
            throw new Error('');
        };
        expect(() => middleware.use(mockReq as never, mockRes as never, nextFn)).toThrow(BadRequestException);
    });
});
