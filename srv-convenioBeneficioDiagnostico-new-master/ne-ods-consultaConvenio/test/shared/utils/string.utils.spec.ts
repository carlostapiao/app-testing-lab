import { maskString, truncateString } from '@/shared/utils/string.utils';

describe('string.utils', () => {
    describe('truncateString', () => {
        it('debe retornar el string tal cual si es corto', () => {
            expect(truncateString('short')).toBe('short');
        });

        it('debe retornar vacío si str está vacío', () => {
            expect(truncateString('')).toBe('');
        });

        it('debe truncar a 50 por defecto y añadir ...', () => {
            const long = 'a'.repeat(60);
            expect(truncateString(long)).toBe(`${'a'.repeat(50)}...`);
        });

        it('debe respetar maxLength personalizado', () => {
            expect(truncateString('hello world', 5)).toBe('hello...');
        });

        it('no debe truncar si length === maxLength', () => {
            const exact = 'a'.repeat(50);
            expect(truncateString(exact)).toBe(exact);
        });
    });

    describe('maskString', () => {
        it('debe enmascarar mostrando solo los primeros 4 caracteres', () => {
            expect(maskString('1234567890')).toBe('1234******');
        });

        it('debe devolver el valor sin enmascarar si tiene 4 o menos caracteres', () => {
            expect(maskString('1234')).toBe('1234');
            expect(maskString('12')).toBe('12');
        });

        it('debe aceptar number y convertirlo a string para enmascarar', () => {
            expect(maskString(123456)).toBe('1234**');
        });
    });
});
