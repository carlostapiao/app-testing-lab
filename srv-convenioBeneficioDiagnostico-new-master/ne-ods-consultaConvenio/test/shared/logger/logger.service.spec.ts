// ...existing code...
import { LoggerService } from '@/shared/logger/logger.service';

describe('LoggerService', () => {
    let mockLogger: {
        debug: jest.Mock;
        info: jest.Mock;
        warn: jest.Mock;
        error: jest.Mock;
    };

    beforeEach(() => {
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
    });

    it('debe crear instancia inyectando el logger y llamar info al iniciar', () => {
        const service = new LoggerService(mockLogger as never);
        expect(mockLogger.info).toHaveBeenCalledWith('LoggerService inicializado');
        expect(service).toBeDefined();
    });

    it('withContext debe devolver objeto con debug, info, warn, error que prefijan el contexto', () => {
        const service = new LoggerService(mockLogger as never);
        const ctx = service.withContext('MyContext');
        ctx.info('mensaje');
        expect(mockLogger.info).toHaveBeenCalledWith('[MyContext] mensaje', undefined);
        ctx.debug('debug msg', { key: 1 });
        expect(mockLogger.debug).toHaveBeenCalledWith('[MyContext] debug msg', { key: 1 });
        ctx.warn('warn msg');
        expect(mockLogger.warn).toHaveBeenCalledWith('[MyContext] warn msg', undefined);
        ctx.error('err msg', 'trace', { meta: true });
        expect(mockLogger.error).toHaveBeenCalledWith('[MyContext] err msg', 'trace', { meta: true });
    });
});
