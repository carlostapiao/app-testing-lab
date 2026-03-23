import { Module } from '@nestjs/common';
import { LoggerService } from '@shared/logger/logger.service';
import { DiagnosticMapper } from './application/mappers/diagnostic.mapper';
import { DiagnosticBenefitMapper } from './application/mappers/diagnostic-benefit.mapper';
import { QueryDiagnosticBenefitsUseCase } from './application/use-cases/query-diagnostic-benefits.use-case';
import { QueryDiagnosticsUseCase } from './application/use-cases/query-diagnostics.use-case';
import { DIAGNOSTIC_REPOSITORY } from './domain/repositories/diagnostic.repository';
import { DIAGNOSTIC_BENEFIT_REPOSITORY } from './domain/repositories/diagnostic-benefit.repository';
import { DiagnosticController } from './infrastructure/controllers/diagnostic.controller';
import { DiagnosticTypeOrmExternalRepository } from './infrastructure/repositories/diagnostic.typeorm.external.repository';
import { DiagnosticBenefitTypeOrmExternalRepository } from './infrastructure/repositories/diagnostic-benefit.typeorm.external.repository';

@Module({
    imports: [],
    controllers: [DiagnosticController],
    providers: [
        DiagnosticMapper,
        DiagnosticBenefitMapper,
        QueryDiagnosticsUseCase,
        QueryDiagnosticBenefitsUseCase,
        DiagnosticTypeOrmExternalRepository,
        DiagnosticBenefitTypeOrmExternalRepository,
        {
            provide: DIAGNOSTIC_REPOSITORY,
            useClass: DiagnosticTypeOrmExternalRepository,
        },
        {
            provide: DIAGNOSTIC_BENEFIT_REPOSITORY,
            useClass: DiagnosticBenefitTypeOrmExternalRepository,
        },
    ],
    exports: [
        QueryDiagnosticsUseCase,
        QueryDiagnosticBenefitsUseCase,
        DIAGNOSTIC_REPOSITORY,
        DIAGNOSTIC_BENEFIT_REPOSITORY,
    ],
})
export class DiagnosticModule {
    private readonly logger = this.loggerService.withContext(DiagnosticModule.name);

    constructor(private readonly loggerService: LoggerService) {
        this.logger.info('Módulo de diagnósticos inicializado correctamente');
        this.logger.info('Caso de uso: Consulta de diagnósticos');
        this.logger.info('BD: adaptador TypeORM (Azure SQL), tabla convenio.Mae_Diagnostico');
        this.logger.info('Controlador: DiagnosticController - POST /diagnosticos, POST /diagnosticos/beneficios');
    }
}
