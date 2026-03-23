import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/logger/logger.service';
import { DIAGNOSTIC_REPOSITORY, type DiagnosticRepository } from '../../domain/repositories/diagnostic.repository';
import { DIAGNOSTIC_MAX_LIMIT, type DiagnosticSearchRequestDto } from '../dtos/requests/diagnostic-search-request.dto';
import type { DiagnosticSearchResponseDto } from '../dtos/responses/diagnostic-search-response.dto';
import { DiagnosticMapper } from '../mappers/diagnostic.mapper';

@Injectable()
export class QueryDiagnosticsUseCase {
    private readonly logger = this.loggerService.withContext(QueryDiagnosticsUseCase.name);

    constructor(
        @Inject(DIAGNOSTIC_REPOSITORY)
        private readonly diagnosticRepository: DiagnosticRepository,
        private readonly loggerService: LoggerService,
        private readonly diagnosticMapper: DiagnosticMapper
    ) {}

    async execute(request: DiagnosticSearchRequestDto): Promise<DiagnosticSearchResponseDto> {
        const startTime = Date.now();
        const pageSize = request.pagination?.limit ?? DIAGNOSTIC_MAX_LIMIT;
        const cursor = request.pagination?.cursor;
        const filters = request.filters;

        this.logger.info('Iniciando listado de diagnósticos (keyset)', {
            pageSize,
            hasCursor: !!cursor,
            appliedFilters: {
                codDiagnostico: filters.codDiagnostico?.length ? filters.codDiagnostico.join(', ') : 'No aplicado',
                estRegistro: filters.estRegistro || 'No aplicado',
                codSistema: filters.codSistema || 'No aplicado',
                codDiagnosticoCount: filters.codDiagnostico?.length ?? 0,
            },
        });

        const result = await this.diagnosticRepository.findByFiltersPaginated(
            {
                codDiagnostico: filters.codDiagnostico ?? [],
                estRegistro: filters.estRegistro,
                codSistema: filters.codSistema,
            },
            { cursor, pageSize }
        );

        const data = result.data.map(e => this.diagnosticMapper.toSummaryDto(e));
        const executionTime = Date.now() - startTime;

        this.logger.info('Listado de diagnósticos completado', {
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
