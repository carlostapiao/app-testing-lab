/**
 * Utilidades para acceder a valores sin usar non-null assertion (!).
 * Evita lint noNonNullAssertion y hace el código más seguro.
 */

/**
 * Devuelve el valor si no es null ni undefined; en caso contrario devuelve defaultValue.
 */
export function getOrDefault<T>(value: T | null | undefined, defaultValue: T): T {
    return value ?? defaultValue;
}

/**
 * Obtiene el valor de un Map para la clave dada, o defaultValue si la clave no existe.
 * Útil para evitar map.get(key)! cuando se conoce un valor por defecto.
 */
export function getFromMap<K, V>(map: Map<K, V>, key: K, defaultValue: V): V {
    const v = map.get(key);
    return v !== undefined ? v : defaultValue;
}

/**
 * Si value es un número finito y mayor que 0 lo devuelve; si no, devuelve fallback.
 * Útil para puertos y valores numéricos de config sin usar non-null assertion.
 */
export function getValidPositiveNumber(value: unknown, fallback: number): number {
    const n = typeof value === 'string' ? Number(value) : value;
    return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : fallback;
}
