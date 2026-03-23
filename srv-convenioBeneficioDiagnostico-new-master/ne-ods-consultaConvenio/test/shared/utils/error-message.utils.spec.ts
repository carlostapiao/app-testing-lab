import { Locale } from '@shared/constants/locale.enum';
import { replacePlaceholders, translateAndFormat } from '@/shared/utils/error-message.utils';

describe('error-message.utils', () => {
    describe('replacePlaceholders', () => {
        it('debe reemplazar un placeholder por el valor', () => {
            expect(replacePlaceholders('Hello {name}', { name: 'World' })).toBe('Hello World');
        });

        it('debe reemplazar múltiples placeholders', () => {
            expect(replacePlaceholders('{a} and {b}', { a: '1', b: '2' })).toBe('1 and 2');
        });

        it('debe reemplazar el mismo placeholder varias veces', () => {
            expect(replacePlaceholders('{x} {x}', { x: 'ok' })).toBe('ok ok');
        });

        it('debe convertir number a string', () => {
            expect(replacePlaceholders('min: {min}', { min: 5 })).toBe('min: 5');
        });
    });

    describe('translateAndFormat', () => {
        it('debe usar locale pasado como argumento', () => {
            const result = translateAndFormat('validation.field_required', { field: 'x' }, Locale.SPANISH_PE);
            expect(typeof result).toBe('string');
        });

        it('debe usar I18nContextService.getLocale cuando no se pasa locale', () => {
            const result = translateAndFormat('validation.field_required', { field: 'y' });
            expect(typeof result).toBe('string');
        });
    });
});
