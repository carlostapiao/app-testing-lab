/**
 * Constantes y construcción de consultas para convenio.Mae_Beneficio.
 * Keyset sobre codBeneficio (índice creado para ello). Filtro API codSubtipoCobertura → columna BD subtipoCobertura.
 * Tipos según estructura Mae_Beneficio para casteo en filtros.
 */

import type { BenefitListFilters } from '../../domain/repositories/benefit.repository';

export const BENEFIT_SCHEMA = 'convenio';
export const BENEFIT_TABLE = 'Mae_Beneficio';

/** Mapa tipo SQL para casteo de parámetros (alias b). */
const BENEFIT_COLUMN_TYPE_MAP: Record<string, string> = {
    'b.codCompania': 'VARCHAR(5)',
    'b.codSistema': 'VARCHAR(5)',
    'b.codCobertura': 'VARCHAR(60)',
    'b.subtipoCobertura': 'VARCHAR(4)',
    'b.estRegistro': 'VARCHAR(5)',
    'b.codBeneficio': 'VARCHAR(5)',
    'b.desBeneficio': 'VARCHAR(200)',
};

function buildCastedParameter(column: string, paramIndex: number): string {
    const sqlType = BENEFIT_COLUMN_TYPE_MAP[column];
    if (!sqlType) return `@${paramIndex}`;
    return `CAST(@${paramIndex} AS ${sqlType})`;
}

/** Columna keyset (codBeneficio, con índice para paginación). */
export const BENEFIT_KEYSET_COLUMN = 'codBeneficio';

/**
 * Fila cruda del listado. Alineado con Mae_Beneficio.
 */
export interface BenefitRawRow {
    codCompania: string | null;
    codSistema: string | null;
    codCobertura: string | null;
    subtipoCobertura: string | null;
    codBeneficio: string | null;
    desBeneficio: string | null;
    estRegistro: string | null;
}

export interface BenefitFilterResult {
    conditions: string[];
    parameters: unknown[];
    parameterCount: number;
}

/**
 * Filtros: API codSubtipoCobertura se mapea a columna BD subtipoCobertura.
 * Parámetros con CAST para uso de índices.
 */
export function buildBenefitFilterConditions(filters: BenefitListFilters): BenefitFilterResult {
    const conditions: string[] = [];
    const parameters: unknown[] = [];
    let paramIndex = 0;

    if (filters.codCompania != null && filters.codCompania !== '') {
        conditions.push(`b.codCompania = ${buildCastedParameter('b.codCompania', paramIndex)}`);
        parameters.push(filters.codCompania);
        paramIndex += 1;
    }
    if (filters.codSistema != null && filters.codSistema !== '') {
        conditions.push(`b.codSistema = ${buildCastedParameter('b.codSistema', paramIndex)}`);
        parameters.push(filters.codSistema);
        paramIndex += 1;
    }
    if (filters.codTipoCobertura != null && filters.codTipoCobertura !== '') {
        conditions.push(`b.codCobertura = ${buildCastedParameter('b.codCobertura', paramIndex)}`);
        parameters.push(filters.codTipoCobertura);
        paramIndex += 1;
    }
    if (filters.codSubtipoCobertura != null && filters.codSubtipoCobertura !== '') {
        conditions.push(`b.subtipoCobertura = ${buildCastedParameter('b.subtipoCobertura', paramIndex)}`);
        parameters.push(filters.codSubtipoCobertura);
        paramIndex += 1;
    }
    if (filters.estRegistro != null && filters.estRegistro !== '') {
        conditions.push(`b.estRegistro = ${buildCastedParameter('b.estRegistro', paramIndex)}`);
        parameters.push(filters.estRegistro);
        paramIndex += 1;
    }

    return { conditions, parameters, parameterCount: paramIndex };
}

export interface BenefitPaginationFilterResult {
    conditions: string[];
    parameters: unknown[];
}

/** Condición keyset sobre codBeneficio. */
export function buildBenefitPaginationFilters(
    cursorId: string | undefined,
    direction: 'next' | 'prev',
    currentParameterCount: number
): BenefitPaginationFilterResult {
    const conditions: string[] = [];
    const parameters: unknown[] = [];
    if (cursorId) {
        parameters.push(cursorId);
        const op = direction === 'next' ? '>' : '<';
        conditions.push(
            `b.${BENEFIT_KEYSET_COLUMN} ${op} ${buildCastedParameter(`b.${BENEFIT_KEYSET_COLUMN}`, currentParameterCount)}`
        );
    }
    return { conditions, parameters };
}

const BENEFIT_LIST_COLUMNS = [
    'b.codBeneficio',
    'b.desBeneficio',
    'b.codCobertura',
    'b.subtipoCobertura',
    'b.estRegistro',
    'b.codSistema',
    'b.codCompania',
] as const;

function buildBenefitListOrderBy(direction: 'ASC' | 'DESC'): string {
    return `b.${BENEFIT_KEYSET_COLUMN} ${direction}`;
}

/**
 * Query keyset: ORDER BY codBeneficio, TOP(take). Cursor sobre codBeneficio.
 */
export function buildKeysetPaginationQuery(take: number, whereClause: string, orderDirection: 'ASC' | 'DESC'): string {
    const schemaTable = `[${BENEFIT_SCHEMA}].[${BENEFIT_TABLE}]`;
    const selectList = BENEFIT_LIST_COLUMNS.join(',\n            ');
    const orderBy = buildBenefitListOrderBy(orderDirection);

    if (orderDirection === 'DESC') {
        return `SELECT * FROM (
  SELECT TOP (${take})
            ${selectList}
  FROM ${schemaTable} AS b
  ${whereClause}
  ORDER BY ${orderBy}
) x
ORDER BY x.${BENEFIT_KEYSET_COLUMN} ASC`;
    }

    return `SELECT TOP (${take})
            ${selectList}
FROM ${schemaTable} AS b
${whereClause}
ORDER BY ${orderBy}`;
}
