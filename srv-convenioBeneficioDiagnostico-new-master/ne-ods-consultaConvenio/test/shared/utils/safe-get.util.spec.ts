import { getFromMap, getOrDefault, getValidPositiveNumber } from '@/shared/utils/safe-get.util';

describe('safe-get.util', () => {
    describe('getOrDefault', () => {
        it('debe retornar el valor si no es null ni undefined', () => {
            expect(getOrDefault('a', 'default')).toBe('a');
            expect(getOrDefault(0, 10)).toBe(0);
        });

        it('debe retornar defaultValue cuando value es null', () => {
            expect(getOrDefault(null, 'default')).toBe('default');
        });

        it('debe retornar defaultValue cuando value es undefined', () => {
            expect(getOrDefault(undefined, 5)).toBe(5);
        });
    });

    describe('getFromMap', () => {
        it('debe retornar el valor si la clave existe', () => {
            const map = new Map([
                ['a', 1],
                ['b', 2],
            ]);
            expect(getFromMap(map, 'a', 0)).toBe(1);
        });

        it('debe retornar defaultValue si la clave no existe', () => {
            const map = new Map([['a', 1]]);
            expect(getFromMap(map, 'b', 99)).toBe(99);
        });
    });

    describe('getValidPositiveNumber', () => {
        it('debe retornar el número si es finito y > 0', () => {
            expect(getValidPositiveNumber(42, 0)).toBe(42);
        });

        it('debe convertir string numérico a número', () => {
            expect(getValidPositiveNumber('8080', 3000)).toBe(8080);
        });

        it('debe retornar fallback si el valor es 0', () => {
            expect(getValidPositiveNumber(0, 100)).toBe(100);
        });

        it('debe retornar fallback si el valor es negativo', () => {
            expect(getValidPositiveNumber(-1, 100)).toBe(100);
        });

        it('debe retornar fallback si el valor no es número válido', () => {
            expect(getValidPositiveNumber(NaN, 100)).toBe(100);
            expect(getValidPositiveNumber('abc', 100)).toBe(100);
        });
    });
});
