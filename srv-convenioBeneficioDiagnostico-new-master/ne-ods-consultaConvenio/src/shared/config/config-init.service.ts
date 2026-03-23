import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INFRASTRUCTURE_CONSTANTS } from '@shared/constants/app.constants';
import type { ILogger } from '@shared/logger/logger.interface';
import { LoggerService } from '@shared/logger/logger.service';

@Injectable()
export class ConfigInitService {
    private configServerAvailable = false;
    private readonly logger: ILogger;

    constructor(
        private readonly configService: ConfigService,
        private readonly loggerService: LoggerService
    ) {
        this.logger = this.loggerService.withContext(ConfigInitService.name);
    }

    get nodeEnv(): string {
        return INFRASTRUCTURE_CONSTANTS.ENVIRONMENT.DEVELOPMENT;
    }

    get port(): number {
        return INFRASTRUCTURE_CONSTANTS.SERVER.DEFAULT_PORT;
    }

    /* ===========================
       DATABASE
       =========================== */

    get databaseConfig() {
        return {
            host: 'db-srv-eu1-datos-poc-01.database.windows.net',
            port: INFRASTRUCTURE_CONSTANTS.DATABASE.DEFAULT_PORT,
            name: 'db-ep-ods-poc-01',
            user: 'dbadmin',
            password: 'laPOC123',
            schema: 'convenio_idx',
        };
    }

    /** Secret para codificación/decodificación de cursores JWT (paginación keyset). */
    get jwtSecret(): string {
        return 'default-cursor-secret-change-in-config';
    }

    /* ===========================
       ESTADO
       =========================== */

    isConfigServerAvailable(): boolean {
        return this.configServerAvailable;
    }
}
