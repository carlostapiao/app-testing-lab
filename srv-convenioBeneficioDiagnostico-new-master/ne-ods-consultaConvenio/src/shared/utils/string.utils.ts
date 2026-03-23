export function truncateString(str: string, maxLength: number = 50): string {
    if (!str || str.length <= maxLength) {
        return str;
    }
    return `${str.substring(0, maxLength)}...`;
}

/**
 * Enmascara un valor mostrando solo los primeros 4 caracteres y ocultando el resto con asteriscos.
 * Si el valor tiene 4 caracteres o menos, se devuelve sin enmascarar.
 *
 * @param value - Valor a enmascarar (string o number)
 * @returns String enmascarado (ej: "1234567890" -> "1234******")
 */
export function maskString(value: string | number): string {
    const s = String(value);
    if (s.length <= 4) return s;
    return s.slice(0, 4) + '*'.repeat(s.length - 4);
}
