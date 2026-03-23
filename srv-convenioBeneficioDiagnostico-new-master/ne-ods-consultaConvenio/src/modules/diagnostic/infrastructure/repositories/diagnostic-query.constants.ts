/**
 * Constantes y construcción de consultas para convenio.Mae_Diagnostico.
 * Keyset sobre codDiagnostico (como en beneficios con codBeneficio). Filtros: codDiagnostico (IN), estRegistro y codSistema opcionales.
 */

import type { DiagnosticListFilters } from '../../domain/repositories/diagnostic.repository';

export const DIAGNOSTIC_SCHEMA = 'convenio';
export const DIAGNOSTIC_TABLE = 'Mae_Diagnostico';

/** Columna keyset (codDiagnostico) para paginación. */
export const DIAGNOSTIC_KEYSET_COLUMN = 'codDiagnostico';

/** Mapa tipo SQL para casteo de parámetros (alias d). */
const DIAGNOSTIC_COLUMN_TYPE_MAP: Record<string, string> = {
    'd.codDiagnostico': 'VARCHAR(7)',
    'd.estRegistro': 'VARCHAR(5)',
    'd.codSistema': 'VARCHAR(5)',
};

function buildCastedParameter(column: string, paramIndex: number): string {
    const sqlType = DIAGNOSTIC_COLUMN_TYPE_MAP[column];
    if (!sqlType) return `@${paramIndex}`;
    return `CAST(@${paramIndex} AS ${sqlType})`;
}

/** Fila cruda del listado. codDiagnostico se usa para keyset. */
export interface DiagnosticRawRow {
    codDiagnostico: string | null;
    desDiagnostico: string | null;
    estRegistro: string | null;
    codSistema: string | null;
}

export interface DiagnosticFilterResult {
    conditions: string[];
    parameters: unknown[];
    parameterCount: number;
}

/**
 * Construye condiciones WHERE: codDiagnostico IN (...), estRegistro y codSistema opcionales.
 */
export function buildDiagnosticFilterConditions(filters: DiagnosticListFilters): DiagnosticFilterResult {
    const conditions: string[] = [];
    const parameters: unknown[] = [];
    let paramIndex = 0;

    if (filters.codDiagnostico != null && filters.codDiagnostico.length > 0) {
        const placeholders = filters.codDiagnostico.map((_, i) =>
            buildCastedParameter('d.codDiagnostico', paramIndex + i)
        );
        parameters.push(...filters.codDiagnostico);
        paramIndex += filters.codDiagnostico.length;
        conditions.push(`d.codDiagnostico IN (${placeholders.join(', ')})`);
    }

    if (filters.estRegistro != null && filters.estRegistro !== '') {
        conditions.push(`d.estRegistro = ${buildCastedParameter('d.estRegistro', paramIndex)}`);
        parameters.push(filters.estRegistro);
        paramIndex += 1;
    }

    if (filters.codSistema != null && filters.codSistema !== '') {
        conditions.push(`d.codSistema = ${buildCastedParameter('d.codSistema', paramIndex)}`);
        parameters.push(filters.codSistema);
        paramIndex += 1;
    }

    return { conditions, parameters, parameterCount: paramIndex };
}

export interface DiagnosticPaginationFilterResult {
    conditions: string[];
    parameters: unknown[];
}

/** Condición keyset sobre codDiagnostico. */
export function buildDiagnosticPaginationFilters(
    cursorId: string | undefined,
    direction: 'next' | 'prev',
    currentParameterCount: number
): DiagnosticPaginationFilterResult {
    const conditions: string[] = [];
    const parameters: unknown[] = [];
    if (cursorId) {
        parameters.push(cursorId);
        const op = direction === 'next' ? '>' : '<';
        conditions.push(
            `d.${DIAGNOSTIC_KEYSET_COLUMN} ${op} ${buildCastedParameter(`d.${DIAGNOSTIC_KEYSET_COLUMN}`, currentParameterCount)}`
        );
    }
    return { conditions, parameters };
}

const DIAGNOSTIC_LIST_COLUMNS = ['d.codDiagnostico', 'd.desDiagnostico', 'd.estRegistro', 'd.codSistema'] as const;

function buildDiagnosticListOrderBy(direction: 'ASC' | 'DESC'): string {
    return `d.${DIAGNOSTIC_KEYSET_COLUMN} ${direction}`;
}

/**
 * Query keyset: ORDER BY codDiagnostico, TOP(take). Cursor sobre codDiagnostico.
 */
export function buildKeysetPaginationQuery(take: number, whereClause: string, orderDirection: 'ASC' | 'DESC'): string {
    const schemaTable = `[${DIAGNOSTIC_SCHEMA}].[${DIAGNOSTIC_TABLE}]`;
    const selectList = DIAGNOSTIC_LIST_COLUMNS.join(',\n            ');
    const orderBy = buildDiagnosticListOrderBy(orderDirection);

    if (orderDirection === 'DESC') {
        return `SELECT * FROM (
  SELECT TOP (${take})
            ${selectList}
  FROM ${schemaTable} AS d
  ${whereClause}
  ORDER BY ${orderBy}
) x
ORDER BY x.${DIAGNOSTIC_KEYSET_COLUMN} ASC`;
    }

    return `SELECT TOP (${take})
            ${selectList}
FROM ${schemaTable} AS d
${whereClause}
ORDER BY ${orderBy}`;
}
