import { NestLoggerAdapter } from '@/shared/logger/nest-logger.adapter';

describe('NestLoggerAdapter', () => {
    let adapter: NestLoggerAdapter;
    let mockLogger: { info: jest.Mock; error: jest.Mock; warn: jest.Mock; debug: jest.Mock };

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        };
        adapter = new NestLoggerAdapter(mockLogger as never);
    });

    it('log debe llamar a logger.info', () => {
        adapter.log('msg');
        expect(mockLogger.info).toHaveBeenCalledWith('msg');
    });

    it('error debe llamar a logger.error', () => {
        adapter.error('err', 'trace');
        expect(mockLogger.error).toHaveBeenCalledWith('err', 'trace');
    });

    it('warn debe llamar a logger.warn', () => {
        adapter.warn('warn');
        expect(mockLogger.warn).toHaveBeenCalledWith('warn');
    });

    it('debug y verbose deben llamar a logger.debug', () => {
        adapter.debug('dbg');
        expect(mockLogger.debug).toHaveBeenCalledWith('dbg');
        adapter.verbose('verb');
        expect(mockLogger.debug).toHaveBeenCalledWith('verb');
    });
});
