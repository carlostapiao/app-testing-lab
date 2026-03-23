import { type DynamicModule, Global, Module } from '@nestjs/common';
import { LOGGER_TOKEN } from './logger.constants';
import type { ILogger } from './logger.interface';
import { LoggerService } from './logger.service';
import { NestLoggerAdapter } from './nest-logger.adapter';
import { ConsoleLogger } from './providers/console.provider';

@Global()
@Module({})
export class LoggerModule {
    static forRoot(): DynamicModule {
        return {
            module: LoggerModule,
            providers: [
                LoggerService,
                {
                    provide: LOGGER_TOKEN,
                    useClass: ConsoleLogger,
                },
                {
                    provide: NestLoggerAdapter,
                    inject: [LOGGER_TOKEN],
                    useFactory: (logger: ILogger) => new NestLoggerAdapter(logger),
                },
            ],
            exports: [LoggerService, NestLoggerAdapter],
        };
    }
}
