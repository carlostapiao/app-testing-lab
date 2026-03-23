import type { BenefitEntity } from '../entities/benefit.entity';

export const BENEFIT_REPOSITORY = Symbol('BenefitRepository');

/** Filtros para el listado de beneficios (todos opcionales; si se definen no deben estar vacíos). API usa codSubtipoCobertura → BD subtipoCobertura. */
export interface BenefitListFilters {
    codCompania?: string;
    codSistema?: string;
    codTipoCobertura?: string;
    codSubtipoCobertura?: string;
    estRegistro?: string;
}

/** Parámetros de paginación keyset (cursor + pageSize). */
export interface KeysetPaginationParams {
    cursor?: string;
    pageSize: number;
}

/** Resultado paginado keyset. */
export interface KeysetPaginatedResult<T> {
    data: T[];
    meta: {
        itemCount: number;
        pageSize: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    cursors: {
        nextCursor: string | null;
        previousCursor: string | null;
    };
}

export interface BenefitRepository {
    findByFiltersPaginated(
        filters: BenefitListFilters,
        pagination: KeysetPaginationParams
    ): Promise<KeysetPaginatedResult<BenefitEntity>>;
}
