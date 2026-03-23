import { Module } from '@nestjs/common';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigInitService } from '@shared/config/config-init.service';
import { LoggerService } from '@shared/logger/logger.service';
import { maskString } from '@shared/utils/string.utils';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigInitService, LoggerService],
            useFactory: async (
                configService: ConfigInitService,
                loggerService: LoggerService
            ): Promise<TypeOrmModuleOptions> => {
                const logger = loggerService.withContext(TypeOrmExternalModule.name);

                logger.info('Inicializando TypeORM para Azure SQL Database (Azure AD SPN)');

                const { host, port, name, schema, user, password } = configService.databaseConfig;

                logger.info('[DB] Configuración', { config: configService.databaseConfig });


                const options: TypeOrmModuleOptions = {
                    type: 'mssql',
                    host,
                    port,
                    database: name,
                    schema,
                    username: user,
                    password,
                    autoLoadEntities: true,
                    synchronize: false,
                    logging: ['error'],
                    retryAttempts: 10,
                    retryDelay: 3000,
                    options: {
                        encrypt: true,
                        trustServerCertificate: false,
                        connectTimeout: 60_000,
                    },
                    extra: {
                        pool: {
                            max: 30,
                            min: 5,
                            idleTimeoutMillis: 30_000,
                            acquireTimeoutMillis: 60_000,
                        },
                    },
                };

                return options;
            },
        }),
    ],
    exports: [TypeOrmModule],
})
export class TypeOrmExternalModule { }
