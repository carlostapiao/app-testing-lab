import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ConfigInitService } from '@shared/config/config-init.service';
import { LoggerService } from '@shared/logger/logger.service';
import { CursorJwtUtil } from '@shared/utils/cursor-jwt.util';
import { DataSource } from 'typeorm';
import { DiagnosticBenefitEntity } from '../../domain/entities/diagnostic-benefit.entity';
import type {
    DiagnosticBenefitListFilters,
    DiagnosticBenefitRepository,
    KeysetPaginatedResult,
    KeysetPaginationParams,
} from '../../domain/repositories/diagnostic-benefit.repository';
import {
    buildDiagnosticBenefitFilterConditions,
    buildDiagnosticBenefitKeysetQuery,
    buildDiagnosticBenefitPaginationFilters,
    type DiagnosticBenefitRawRow,
} from './diagnostic-benefit-query.constants';

/** Delimiter para codificar cursor compuesto (codDiagnostico, codBeneficio). */
const CURSOR_COMPOSITE_SEP = '\u001e';

/**
 * Implementación de DiagnosticBenefitRepository.
 * Query: Mae_DiagnosticoBeneficio db LEFT JOIN Mae_Beneficio b INNER JOIN Mae_Diagnostico d.
 * Keyset compuesto: (codDiagnostico, codBeneficio).
 */
@Injectable()
export class DiagnosticBenefitTypeOrmExternalRepository implements DiagnosticBenefitRepository {
    private readonly logger = this.loggerService.withContext(DiagnosticBenefitTypeOrmExternalRepository.name);

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        private readonly configService: ConfigInitService,
        private readonly loggerService: LoggerService
    ) {}

    async findByFiltersPaginated(
        filters: DiagnosticBenefitListFilters,
        pagination: KeysetPaginationParams
    ): Promise<KeysetPaginatedResult<DiagnosticBenefitEntity>> {
        const { direction, cursorCodDiagnostico, cursorCodBeneficio } = this.parseCursor(pagination.cursor);

        this.logger.info('Ejecutando listado diagnósticos-beneficios con paginación keyset (external)', {
            cursor: pagination.cursor ? 'presente' : 'primera-página',
            direction,
            pageSize: pagination.pageSize,
        });

        const filterConditions = buildDiagnosticBenefitFilterConditions(filters);
        const paginationFilters = buildDiagnosticBenefitPaginationFilters(
            cursorCodDiagnostico,
            cursorCodBeneficio,
            direction,
            filterConditions.parameterCount
        );
        const allConditions = [...filterConditions.conditions, ...paginationFilters.conditions];
        const allParameters = [...filterConditions.parameters, ...paginationFilters.parameters];
        const whereClause = allConditions.length > 0 ? ` WHERE ${allConditions.join(' AND ')}` : '';
        const take = pagination.pageSize + 1;
        const orderDirection = direction === 'prev' ? 'DESC' : 'ASC';
        const query = buildDiagnosticBenefitKeysetQuery(take, whereClause, orderDirection);

        // Log de la query SQL final con parámetros
        this.logger.info('Ejecutando query SQL para consulta de diagnósticos-beneficios', {
            sqlQuery: query,
            parameters: allParameters,
        });

        try {
            const queryStartTime = Date.now();
            const rawResults = (await this.dataSource.query<DiagnosticBenefitRawRow[]>(query, allParameters)) ?? [];
            const queryExecutionTime = Date.now() - queryStartTime;

            this.logger.info('Query SQL ejecutada exitosamente', {
                queryExecutionTimeMs: queryExecutionTime,
                resultCount: rawResults.length,
            });
            const hasNextPage = rawResults.length > pagination.pageSize;
            const dataItems = hasNextPage ? rawResults.slice(0, pagination.pageSize) : rawResults;
            const entities = dataItems.map(r => this.mapRawToEntity(r));

            const { nextCursor, previousCursor, hasPreviousPage } = this.buildCursorsData(
                entities,
                direction,
                hasNextPage,
                pagination.cursor,
                cursorCodDiagnostico,
                cursorCodBeneficio
            );

            return {
                data: entities,
                meta: {
                    itemCount: entities.length,
                    pageSize: pagination.pageSize,
                    hasNextPage: direction === 'next' ? hasNextPage : !!nextCursor,
                    hasPreviousPage,
                },
                cursors: { nextCursor, previousCursor },
            };
        } catch (error) {
            this.logger.error(
                'Error en la búsqueda del listado diagnósticos-beneficios (external)',
                (error as Error).stack,
                { error: (error as Error).message, filters }
            );
            throw error;
        }
    }

    private buildCursorsData(
        dataItems: DiagnosticBenefitEntity[],
        direction: 'next' | 'prev',
        hasNextPage: boolean,
        currentCursor: string | undefined,
        cursorCodDiagnostico: string | undefined,
        cursorCodBeneficio: string | undefined
    ): { nextCursor: string | null; previousCursor: string | null; hasPreviousPage: boolean } {
        if (dataItems.length === 0) {
            return this.buildEmptyCursorsData(direction, cursorCodDiagnostico, cursorCodBeneficio);
        }
        return direction === 'next'
            ? this.buildNextDirectionCursors(dataItems, hasNextPage, currentCursor)
            : this.buildPrevDirectionCursors(dataItems, hasNextPage);
    }

    private buildEmptyCursorsData(
        direction: 'next' | 'prev',
        cursorCodDiagnostico: string | undefined,
        cursorCodBeneficio: string | undefined
    ): { nextCursor: string | null; previousCursor: string | null; hasPreviousPage: boolean } {
        const hasCursor = cursorCodDiagnostico !== undefined && cursorCodBeneficio !== undefined;
        const isNavigatingBeforeFirst = direction === 'prev' && hasCursor;
        if (isNavigatingBeforeFirst && cursorCodDiagnostico !== undefined && cursorCodBeneficio !== undefined) {
            return {
                nextCursor: this.encodeCompositeCursor('next', cursorCodDiagnostico, cursorCodBeneficio),
                previousCursor: null,
                hasPreviousPage: false,
            };
        }
        return {
            nextCursor: null,
            previousCursor: null,
            hasPreviousPage: false,
        };
    }

    private buildNextDirectionCursors(
        dataItems: DiagnosticBenefitEntity[],
        hasNextPage: boolean,
        currentCursor: string | undefined
    ): { nextCursor: string | null; previousCursor: string | null; hasPreviousPage: boolean } {
        const last = dataItems[dataItems.length - 1];
        const first = dataItems[0];
        const lastKey = this.encodeCompositeCursor('next', last.codDiagnostico ?? '', last.codBeneficio ?? '');
        const firstKey = this.encodeCompositeCursor('prev', first.codDiagnostico ?? '', first.codBeneficio ?? '');
        return {
            nextCursor: hasNextPage ? lastKey : null,
            previousCursor: currentCursor ? firstKey : null,
            hasPreviousPage: !!currentCursor,
        };
    }

    private buildPrevDirectionCursors(
        dataItems: DiagnosticBenefitEntity[],
        hasNextPage: boolean
    ): { nextCursor: string | null; previousCursor: string | null; hasPreviousPage: boolean } {
        const last = dataItems[dataItems.length - 1];
        const first = dataItems[0];
        return {
            nextCursor: this.encodeCompositeCursor('next', last.codDiagnostico ?? '', last.codBeneficio ?? ''),
            previousCursor: hasNextPage
                ? this.encodeCompositeCursor('prev', first.codDiagnostico ?? '', first.codBeneficio ?? '')
                : null,
            hasPreviousPage: hasNextPage,
        };
    }

    private parseCursor(cursor: string | undefined): {
        direction: 'next' | 'prev';
        cursorCodDiagnostico: string | undefined;
        cursorCodBeneficio: string | undefined;
    } {
        if (!cursor) return { direction: 'next', cursorCodDiagnostico: undefined, cursorCodBeneficio: undefined };
        try {
            const decoded = CursorJwtUtil.decode(cursor, this.configService.jwtSecret);
            const parts = (decoded.id ?? '').split(CURSOR_COMPOSITE_SEP);
            if (parts.length < 2) {
                return { direction: decoded.direction, cursorCodDiagnostico: undefined, cursorCodBeneficio: undefined };
            }
            return {
                direction: decoded.direction,
                cursorCodDiagnostico: parts[0],
                cursorCodBeneficio: parts[1],
            };
        } catch (error) {
            this.logger.warn('Error al decodificar el cursor', {
                error: (error as Error).message,
            } as Record<string, unknown>);
            throw error;
        }
    }

    private encodeCompositeCursor(direction: 'next' | 'prev', codDiagnostico: string, codBeneficio: string): string {
        const id = `${codDiagnostico}${CURSOR_COMPOSITE_SEP}${codBeneficio}`;
        return CursorJwtUtil.encode(id, direction, this.configService.jwtSecret);
    }

    private mapRawToEntity(raw: DiagnosticBenefitRawRow): DiagnosticBenefitEntity {
        return DiagnosticBenefitEntity.create({
            codSistemaDiagnosticoBeneficio: raw.codSistemaDiagnosticoBeneficio ?? null,
            estDiagnosticoBeneficio: raw.estDiagnosticoBeneficio ?? null,
            codSistemaDiagnostico: raw.codSistemaDiagnostico ?? null,
            codDiagnostico: raw.codDiagnostico ?? null,
            desDiagnostico: raw.desDiagnostico ?? null,
            estDiagnostico: raw.estDiagnostico ?? null,
            codSistemaBeneficio: raw.codSistemaBeneficio ?? null,
            codBeneficio: raw.codBeneficio ?? null,
            desBeneficio: raw.desBeneficio ?? null,
            estBeneficio: raw.estBeneficio ?? null,
        });
    }
}
