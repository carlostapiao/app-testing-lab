import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/logger/logger.service';
import {
    DIAGNOSTIC_BENEFIT_REPOSITORY,
    type DiagnosticBenefitRepository,
} from '../../domain/repositories/diagnostic-benefit.repository';
import {
    DIAGNOSTIC_BENEFIT_MAX_LIMIT,
    type DiagnosticBenefitSearchRequestDto,
} from '../dtos/requests/diagnostic-benefit-search-request.dto';
import type { DiagnosticBenefitSearchResponseDto } from '../dtos/responses/diagnostic-benefit-search-response.dto';
import { DiagnosticBenefitMapper } from '../mappers/diagnostic-benefit.mapper';

@Injectable()
export class QueryDiagnosticBenefitsUseCase {
    private readonly logger = this.loggerService.withContext(QueryDiagnosticBenefitsUseCase.name);

    constructor(
        @Inject(DIAGNOSTIC_BENEFIT_REPOSITORY)
        private readonly diagnosticBenefitRepository: DiagnosticBenefitRepository,
        private readonly loggerService: LoggerService,
        private readonly diagnosticBenefitMapper: DiagnosticBenefitMapper
    ) {}

    async execute(request: DiagnosticBenefitSearchRequestDto): Promise<DiagnosticBenefitSearchResponseDto> {
        const startTime = Date.now();
        const pageSize = request.pagination?.limit ?? DIAGNOSTIC_BENEFIT_MAX_LIMIT;
        const cursor = request.pagination?.cursor;
        const filters = request.filters;

        this.logger.info('Iniciando listado diagnósticos-beneficios (keyset)', {
            pageSize,
            hasCursor: !!cursor,
            appliedFilters: {
                codSistemaDiagnosticoBeneficio: filters.codSistemaDiagnosticoBeneficio || 'No aplicado',
                codDiagnostico: filters.codDiagnostico || 'No aplicado',
                codBeneficio: filters.codBeneficio || 'No aplicado',
                estDiagnosticoBeneficio: filters.estDiagnosticoBeneficio || 'No aplicado',
            },
        });

        const result = await this.diagnosticBenefitRepository.findByFiltersPaginated(
            {
                codSistemaDiagnosticoBeneficio: filters.codSistemaDiagnosticoBeneficio,
                codDiagnostico: filters.codDiagnostico,
                codBeneficio: filters.codBeneficio,
                estDiagnosticoBeneficio: filters.estDiagnosticoBeneficio,
            },
            { cursor, pageSize }
        );

        const data = result.data.map(e => this.diagnosticBenefitMapper.toSummaryDto(e));
        const executionTime = Date.now() - startTime;

        this.logger.info('Listado diagnósticos-beneficios completado', {
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
