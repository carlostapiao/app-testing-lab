import type { DiagnosticEntity } from '../entities/diagnostic.entity';

export const DIAGNOSTIC_REPOSITORY = Symbol('DiagnosticRepository');

/** Filtros para el listado de diagnósticos. codDiagnostico obligatorio (array). estRegistro y codSistema opcionales. */
export interface DiagnosticListFilters {
    codDiagnostico: string[];
    estRegistro?: string;
    codSistema?: string;
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

export interface DiagnosticRepository {
    findByFiltersPaginated(
        filters: DiagnosticListFilters,
        pagination: KeysetPaginationParams
    ): Promise<KeysetPaginatedResult<DiagnosticEntity>>;
}
