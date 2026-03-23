/**
 * Constantes y construcción de consultas para diagnósticos-beneficios.
 * FROM Mae_DiagnosticoBeneficio db
 * INNER JOIN Mae_Beneficio b ON db.codBeneficio = b.codBeneficio  (beneficio debe existir)
 * INNER JOIN Mae_Diagnostico d ON db.codDiagnostico = d.codDiagnostico  (diagnóstico debe existir)
 * Keyset compuesto: (db.codDiagnostico, db.codBeneficio).
 */

import type { DiagnosticBenefitListFilters } from '../../domain/repositories/diagnostic-benefit.repository';

export const DIAGNOSTIC_BENEFIT_SCHEMA = 'convenio';
export const DIAGNOSTIC_BENEFIT_TABLE = 'Mae_DiagnosticoBeneficio';
export const BENEFIT_TABLE = 'Mae_Beneficio';
export const DIAGNOSTIC_TABLE = 'Mae_Diagnostico';

const ALIAS_DB = 'db';

const COLUMN_TYPE_MAP: Record<string, string> = {
    [`${ALIAS_DB}.codSistema`]: 'VARCHAR(5)',
    [`${ALIAS_DB}.codDiagnostico`]: 'VARCHAR(7)',
    [`${ALIAS_DB}.codBeneficio`]: 'VARCHAR(5)',
    [`${ALIAS_DB}.estRegistro`]: 'VARCHAR(5)',
};

function buildCastedParameter(column: string, paramIndex: number): string {
    const sqlType = COLUMN_TYPE_MAP[column];
    if (!sqlType) return `@${paramIndex}`;
    return `CAST(@${paramIndex} AS ${sqlType})`;
}

/** Fila cruda del listado (db + datos opcionales de d y b). */
export interface DiagnosticBenefitRawRow {
    codSistemaDiagnosticoBeneficio: string | null;
    estDiagnosticoBeneficio: string | null;
    codSistemaDiagnostico: string | null;
    codDiagnostico: string | null;
    desDiagnostico: string | null;
    estDiagnostico: string | null;
    codSistemaBeneficio: string | null;
    codBeneficio: string | null;
    desBeneficio: string | null;
    estBeneficio: string | null;
}

export interface DiagnosticBenefitFilterResult {
    conditions: string[];
    parameters: unknown[];
    parameterCount: number;
}

export function buildDiagnosticBenefitFilterConditions(
    filters: DiagnosticBenefitListFilters
): DiagnosticBenefitFilterResult {
    const conditions: string[] = [];
    const parameters: unknown[] = [];
    let paramIndex = 0;

    if (filters.codSistemaDiagnosticoBeneficio != null && filters.codSistemaDiagnosticoBeneficio !== '') {
        conditions.push(`${ALIAS_DB}.codSistema = ${buildCastedParameter(`${ALIAS_DB}.codSistema`, paramIndex)}`);
        parameters.push(filters.codSistemaDiagnosticoBeneficio);
        paramIndex += 1;
    }

    if (filters.codDiagnostico != null && filters.codDiagnostico.length > 0) {
        const placeholders = filters.codDiagnostico.map((_, i) =>
            buildCastedParameter(`${ALIAS_DB}.codDiagnostico`, paramIndex + i)
        );
        parameters.push(...filters.codDiagnostico);
        paramIndex += filters.codDiagnostico.length;
        conditions.push(`${ALIAS_DB}.codDiagnostico IN (${placeholders.join(', ')})`);
    }

    if (filters.codBeneficio != null && filters.codBeneficio !== '') {
        conditions.push(`${ALIAS_DB}.codBeneficio = ${buildCastedParameter(`${ALIAS_DB}.codBeneficio`, paramIndex)}`);
        parameters.push(filters.codBeneficio);
        paramIndex += 1;
    }

    if (filters.estDiagnosticoBeneficio != null && filters.estDiagnosticoBeneficio !== '') {
        conditions.push(`${ALIAS_DB}.estRegistro = ${buildCastedParameter(`${ALIAS_DB}.estRegistro`, paramIndex)}`);
        parameters.push(filters.estDiagnosticoBeneficio);
        paramIndex += 1;
    }

    return { conditions, parameters, parameterCount: paramIndex };
}

export interface DiagnosticBenefitPaginationFilterResult {
    conditions: string[];
    parameters: unknown[];
}

/** Keyset compuesto (codDiagnostico, codBeneficio): (col1 > @p0) OR (col1 = @p0 AND col2 > @p1). */
export function buildDiagnosticBenefitPaginationFilters(
    cursorCodDiagnostico: string | undefined,
    cursorCodBeneficio: string | undefined,
    direction: 'next' | 'prev',
    currentParameterCount: number
): DiagnosticBenefitPaginationFilterResult {
    const conditions: string[] = [];
    const parameters: unknown[] = [];
    if (
        cursorCodDiagnostico !== undefined &&
        cursorCodDiagnostico !== '' &&
        cursorCodBeneficio !== undefined &&
        cursorCodBeneficio !== ''
    ) {
        parameters.push(cursorCodDiagnostico, cursorCodBeneficio);
        const op = direction === 'next' ? '>' : '<';
        const col1 = `${ALIAS_DB}.codDiagnostico`;
        const col2 = `${ALIAS_DB}.codBeneficio`;
        conditions.push(
            `(${col1} ${op} ${buildCastedParameter(col1, currentParameterCount)} OR (${col1} = ${buildCastedParameter(col1, currentParameterCount)} AND ${col2} ${op} ${buildCastedParameter(col2, currentParameterCount + 1)}))`
        );
    }
    return { conditions, parameters };
}

const LIST_COLUMNS = [
    `db.codSistema AS codSistemaDiagnosticoBeneficio`,
    `db.estRegistro AS estDiagnosticoBeneficio`,
    `d.codSistema AS codSistemaDiagnostico`,
    `db.codDiagnostico`,
    `d.desDiagnostico`,
    `d.estRegistro AS estDiagnostico`,
    `b.codSistema AS codSistemaBeneficio`,
    `db.codBeneficio`,
    `b.desBeneficio`,
    `b.estRegistro AS estBeneficio`,
] as const;

const KEYSET_ORDER_COLUMNS = ['codDiagnostico', 'codBeneficio'] as const;

function buildOrderBy(direction: 'ASC' | 'DESC'): string {
    return KEYSET_ORDER_COLUMNS.map(c => `${ALIAS_DB}.${c} ${direction}`).join(', ');
}

/**
 * Query keyset: FROM db INNER JOIN b INNER JOIN d, ORDER BY codDiagnostico, codBeneficio, TOP(take).
 */
export function buildDiagnosticBenefitKeysetQuery(
    take: number,
    whereClause: string,
    orderDirection: 'ASC' | 'DESC'
): string {
    const schema = `[${DIAGNOSTIC_BENEFIT_SCHEMA}]`;
    const fromDb = `${schema}.[${DIAGNOSTIC_BENEFIT_TABLE}] AS db`;
    const innerJoinB = `INNER JOIN ${schema}.[${BENEFIT_TABLE}] AS b ON db.codBeneficio = b.codBeneficio`;
    const innerJoinD = `INNER JOIN ${schema}.[${DIAGNOSTIC_TABLE}] AS d ON db.codDiagnostico = d.codDiagnostico`;
    const selectList = LIST_COLUMNS.join(',\n            ');
    const orderBy = buildOrderBy(orderDirection);

    const fromJoin = `FROM ${fromDb}\n  ${innerJoinB}\n  ${innerJoinD}\n${whereClause}\n  ORDER BY ${orderBy}`;

    if (orderDirection === 'DESC') {
        const orderByAsc = KEYSET_ORDER_COLUMNS.map(c => `x.${c} ASC`).join(', ');
        return `SELECT * FROM (
  SELECT TOP (${take})
            ${selectList}
  ${fromJoin}
) x
ORDER BY ${orderByAsc}`;
    }

    return `SELECT TOP (${take})
            ${selectList}
  ${fromJoin}`;
}
