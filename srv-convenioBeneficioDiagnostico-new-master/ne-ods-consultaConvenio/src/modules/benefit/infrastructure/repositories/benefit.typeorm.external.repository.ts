import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ConfigInitService } from '@shared/config/config-init.service';
import { LoggerService } from '@shared/logger/logger.service';
import { CursorJwtUtil } from '@shared/utils/cursor-jwt.util';
import { DataSource } from 'typeorm';
import { BenefitEntity } from '../../domain/entities/benefit.entity';
import type {
    BenefitListFilters,
    BenefitRepository,
    KeysetPaginatedResult,
    KeysetPaginationParams,
} from '../../domain/repositories/benefit.repository';
import {
    type BenefitRawRow,
    buildBenefitFilterConditions,
    buildBenefitPaginationFilters,
    buildKeysetPaginationQuery,
} from './benefit-query.constants';

/**
 * Implementación de BenefitRepository usando TypeORM external con DataSource.query().
 * Usar cuando la app use TypeOrmExternalModule; ejecuta la misma SQL que el internal vía .query().
 */
@Injectable()
export class BenefitTypeOrmExternalRepository implements BenefitRepository {
    private readonly logger = this.loggerService.withContext(BenefitTypeOrmExternalRepository.name);

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        private readonly configService: ConfigInitService,
        private readonly loggerService: LoggerService
    ) {}

    async findByFiltersPaginated(
        filters: BenefitListFilters,
        pagination: KeysetPaginationParams
    ): Promise<KeysetPaginatedResult<BenefitEntity>> {
        const { direction, cursorId } = this.parseCursor(pagination.cursor);

        this.logger.info('Ejecutando listado de beneficios con paginación keyset (external)', {
            cursor: pagination.cursor ? 'presente' : 'primera-página',
            direction,
            pageSize: pagination.pageSize,
        });

        const filterConditions = buildBenefitFilterConditions(filters);
        const paginationFilters = buildBenefitPaginationFilters(cursorId, direction, filterConditions.parameterCount);
        const allConditions = [...filterConditions.conditions, ...paginationFilters.conditions];
        const allParameters = [...filterConditions.parameters, ...paginationFilters.parameters];
        const whereClause = allConditions.length > 0 ? ` WHERE ${allConditions.join(' AND ')}` : '';
        const take = pagination.pageSize + 1;
        const orderDirection = direction === 'prev' ? 'DESC' : 'ASC';
        const query = buildKeysetPaginationQuery(take, whereClause, orderDirection);

        // Log de la query SQL final con parámetros
        this.logger.info('Ejecutando query SQL para consulta de beneficios', {
            sqlQuery: query,
            parameters: allParameters,
        });

        try {
            const queryStartTime = Date.now();
            const rawResults = (await this.dataSource.query<BenefitRawRow[]>(query, allParameters)) ?? [];
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
                cursorId
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
            this.logger.error('Error en la búsqueda del listado de beneficios (external)', (error as Error).stack, {
                error: (error as Error).message,
                filters,
            });
            throw error;
        }
    }

    private buildCursorsData(
        dataItems: BenefitEntity[],
        direction: 'next' | 'prev',
        hasNextPage: boolean,
        currentCursor: string | undefined,
        cursorId: string | undefined
    ): { nextCursor: string | null; previousCursor: string | null; hasPreviousPage: boolean } {
        if (dataItems.length === 0) {
            return this.buildEmptyCursorsData(direction, cursorId);
        }
        return direction === 'next'
            ? this.buildNextDirectionCursors(dataItems, hasNextPage, currentCursor)
            : this.buildPrevDirectionCursors(dataItems, hasNextPage);
    }

    private buildEmptyCursorsData(
        direction: 'next' | 'prev',
        cursorId: string | undefined
    ): { nextCursor: string | null; previousCursor: string | null; hasPreviousPage: boolean } {
        const isNavigatingBeforeFirst = direction === 'prev' && cursorId;
        if (isNavigatingBeforeFirst) {
            return {
                nextCursor: this.encodeCursor('next', cursorId),
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
        dataItems: BenefitEntity[],
        hasNextPage: boolean,
        currentCursor: string | undefined
    ): { nextCursor: string | null; previousCursor: string | null; hasPreviousPage: boolean } {
        const lastCod = dataItems[dataItems.length - 1].codBeneficio ?? '';
        const firstCod = dataItems[0].codBeneficio ?? '';
        return {
            nextCursor: hasNextPage ? this.encodeCursor('next', lastCod) : null,
            previousCursor: currentCursor ? this.encodeCursor('prev', firstCod) : null,
            hasPreviousPage: !!currentCursor,
        };
    }

    private buildPrevDirectionCursors(
        dataItems: BenefitEntity[],
        hasNextPage: boolean
    ): { nextCursor: string | null; previousCursor: string | null; hasPreviousPage: boolean } {
        const lastCod = dataItems[dataItems.length - 1].codBeneficio ?? '';
        const firstCod = dataItems[0].codBeneficio ?? '';
        return {
            nextCursor: this.encodeCursor('next', lastCod),
            previousCursor: hasNextPage ? this.encodeCursor('prev', firstCod) : null,
            hasPreviousPage: hasNextPage,
        };
    }

    private parseCursor(cursor: string | undefined): { direction: 'next' | 'prev'; cursorId: string | undefined } {
        if (!cursor) return { direction: 'next', cursorId: undefined };
        try {
            const decoded = CursorJwtUtil.decode(cursor, this.configService.jwtSecret);
            return { direction: decoded.direction, cursorId: decoded.id };
        } catch (error) {
            this.logger.warn('Error al decodificar el cursor', { error: (error as Error).message } as Record<
                string,
                unknown
            >);
            throw error;
        }
    }

    private encodeCursor(direction: 'next' | 'prev', id: string): string {
        return CursorJwtUtil.encode(id, direction, this.configService.jwtSecret);
    }

    private mapRawToEntity(raw: BenefitRawRow): BenefitEntity {
        return BenefitEntity.create({
            codCompania: raw.codCompania ?? null,
            codSistema: raw.codSistema ?? null,
            codCobertura: raw.codCobertura ?? null,
            codSubTipoCobertura: raw.subtipoCobertura ?? null,
            codBeneficio: raw.codBeneficio ?? null,
            desBeneficio: raw.desBeneficio ?? null,
            estRegistro: raw.estRegistro ?? null,
        });
    }
}
