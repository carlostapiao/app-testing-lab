import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/logger/logger.service';
import { BENEFIT_REPOSITORY, type BenefitRepository } from '../../domain/repositories/benefit.repository';
import { BENEFIT_MAX_LIMIT, type BenefitSearchRequestDto } from '../dtos/requests/benefit-search-request.dto';
import type { BenefitSearchResponseDto } from '../dtos/responses/benefit-search-response.dto';
import { BenefitMapper } from '../mappers/benefit.mapper';

@Injectable()
export class QueryBenefitsUseCase {
    private readonly logger = this.loggerService.withContext(QueryBenefitsUseCase.name);

    constructor(
        @Inject(BENEFIT_REPOSITORY)
        private readonly benefitRepository: BenefitRepository,
        private readonly loggerService: LoggerService,
        private readonly benefitMapper: BenefitMapper
    ) {}

    async execute(request: BenefitSearchRequestDto): Promise<BenefitSearchResponseDto> {
        const startTime = Date.now();
        const pageSize = request.pagination?.limit ?? BENEFIT_MAX_LIMIT;
        const cursor = request.pagination?.cursor;
        const filters = request.filters ?? {};

        this.logger.info('Iniciando listado de beneficios (keyset)', {
            pageSize,
            hasCursor: !!cursor,
            hasFilters: Object.keys(filters).length > 0,
            appliedFilters: {
                codCompania: filters.codCompania || 'No aplicado',
                codSistema: filters.codSistema || 'No aplicado',
                codTipoCobertura: filters.codTipoCobertura || 'No aplicado',
                codSubtipoCobertura: filters.codSubtipoCobertura || 'No aplicado',
                estRegistro: filters.estRegistro || 'No aplicado',
            },
        });

        const result = await this.benefitRepository.findByFiltersPaginated(
            {
                codCompania: filters.codCompania,
                codSistema: filters.codSistema,
                codTipoCobertura: filters.codTipoCobertura,
                codSubtipoCobertura: filters.codSubtipoCobertura,
                estRegistro: filters.estRegistro,
            },
            { cursor, pageSize }
        );

        const data = result.data.map(e => this.benefitMapper.toSummaryDto(e));
        const executionTime = Date.now() - startTime;

        this.logger.info('Listado de beneficios completado', {
            itemCount: data.length,
            hasNextPage: result.meta.hasNextPage,
            executionTimeMs: executionTime,
            totalPageSize: pageSize,
        });

        return {
            data,
            meta: result.meta,
            cursors: result.cursors,
        };
    }
}
