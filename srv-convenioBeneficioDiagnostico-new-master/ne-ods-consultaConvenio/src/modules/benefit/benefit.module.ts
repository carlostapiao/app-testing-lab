import { Module } from '@nestjs/common';
import { LoggerService } from '@shared/logger/logger.service';
import { BenefitMapper } from './application/mappers/benefit.mapper';
import { QueryBenefitsUseCase } from './application/use-cases/query-benefits.use-case';
import { BENEFIT_REPOSITORY } from './domain/repositories/benefit.repository';
import { BenefitController } from './infrastructure/controllers/benefit.controller';
import { BenefitTypeOrmExternalRepository } from './infrastructure/repositories/benefit.typeorm.external.repository';

@Module({
    imports: [],
    controllers: [BenefitController],
    providers: [
        BenefitMapper,
        QueryBenefitsUseCase,
        BenefitTypeOrmExternalRepository,
        {
            provide: BENEFIT_REPOSITORY,
            useClass: BenefitTypeOrmExternalRepository,
        },
    ],
    exports: [QueryBenefitsUseCase, BENEFIT_REPOSITORY],
})
export class BenefitModule {
    private readonly logger = this.loggerService.withContext(BenefitModule.name);

    constructor(private readonly loggerService: LoggerService) {
        this.logger.info('Módulo de beneficios inicializado correctamente');
        this.logger.info('Caso de uso: Consulta de beneficios');
        this.logger.info('BD: adaptador TypeORM (Azure SQL), tabla convenio.Mae_Beneficio');
        this.logger.info('Controlador: BenefitController - POST /beneficios');
    }
}
