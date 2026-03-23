import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigInitModule } from '@shared/config/config-init.module';
import { TypeOrmExternalModule } from '@shared/databases/external/typeorm.external.module';
import { LoggerModule } from '@shared/logger/logger.module';
import { loadYmlConfigSync } from '@shared/utils/yml.util';
import { AppController } from './app.controller';
import { BenefitModule } from './modules/benefit/benefit.module';
import { DiagnosticModule } from './modules/diagnostic/diagnostic.module';
import { SecurityMiddleware } from './shared/middleware/security.middleware';
import { SharedModule } from './shared/shared.module';

@Module({
    controllers: [AppController],
    providers: [],
    imports: [
        LoggerModule.forRoot(),
        NestConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [() => loadYmlConfigSync()],
        }),
        ConfigInitModule.forRoot(),
        SharedModule,
        TypeOrmExternalModule,
        BenefitModule,
        DiagnosticModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(SecurityMiddleware).forRoutes('*');
    }
}
