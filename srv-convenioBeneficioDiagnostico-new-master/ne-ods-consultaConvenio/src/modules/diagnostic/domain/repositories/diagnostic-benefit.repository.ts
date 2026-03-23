import type { DiagnosticBenefitEntity } from '../entities/diagnostic-benefit.entity';

export const DIAGNOSTIC_BENEFIT_REPOSITORY = Symbol('DiagnosticBenefitRepository');

/** Filtros para listado diagnósticos-beneficios. Al menos uno requerido. */
export interface DiagnosticBenefitListFilters {
    codSistemaDiagnosticoBeneficio?: string;
    codDiagnostico?: string[];
    codBeneficio?: string;
    estDiagnosticoBeneficio?: string;
}

export interface KeysetPaginationParams {
    cursor?: string;
    pageSize: number;
}

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

export interface DiagnosticBenefitRepository {
    findByFiltersPaginated(
        filters: DiagnosticBenefitListFilters,
        pagination: KeysetPaginationParams
    ): Promise<KeysetPaginatedResult<DiagnosticBenefitEntity>>;
}
