import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_TOKEN } from './logger.constants';
import type { ILogger } from './logger.interface';

@Injectable()
export class LoggerService {
    constructor(@Inject(LOGGER_TOKEN) private readonly logger: ILogger) {
        this.logger.info('LoggerService inicializado');
    }

    withContext(context: string) {
        return {
            debug: (msg: string, meta?: Record<string, unknown>) => this.logger.debug(`[${context}] ${msg}`, meta),
            info: (msg: string, meta?: Record<string, unknown>) => this.logger.info(`[${context}] ${msg}`, meta),
            warn: (msg: string, meta?: Record<string, unknown>) => this.logger.warn(`[${context}] ${msg}`, meta),
            error: (msg: string, trace?: string, meta?: Record<string, unknown>) =>
                this.logger.error(`[${context}] ${msg}`, trace, meta),
        };
    }
}
