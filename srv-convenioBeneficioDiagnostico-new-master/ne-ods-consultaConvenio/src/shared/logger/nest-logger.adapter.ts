import type { LoggerService as NestLogger } from '@nestjs/common';
import type { ILogger } from './logger.interface';

export class NestLoggerAdapter implements NestLogger {
    constructor(private readonly logger: ILogger) {}

    log(message: string) {
        this.logger.info(message);
    }

    error(message: string, trace?: string) {
        this.logger.error(message, trace);
    }

    warn(message: string) {
        this.logger.warn(message);
    }

    debug(message: string) {
        this.logger.debug(message);
    }

    verbose(message: string) {
        this.logger.debug(message);
    }
}
