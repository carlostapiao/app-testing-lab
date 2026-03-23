import { Locale } from '@/shared/constants/locale.enum';
import { translate, translateError } from '@/shared/services/translation.service';

jest.mock('@/shared/services/i18n-loader.service', () => ({
    I18nLoaderService: {
        loadMessages: jest.fn(() => ({})),
        getNestedValue: jest.fn(),
    },
}));

describe('translation.service', () => {
    beforeEach(() => {
        const { I18nLoaderService } = require('@/shared/services/i18n-loader.service');
        I18nLoaderService.getNestedValue.mockImplementation((_o: unknown, key: string) =>
            key === 'existing.key' ? 'Translated' : undefined
        );
    });

    it('translateError debe devolver la traducción cuando existe', () => {
        expect(translateError('existing.key')).toBe('Translated');
    });

    it('translateError debe devolver messageKey cuando no hay traducción ni fallback en inglés', () => {
        expect(translateError('missing.key')).toBe('missing.key');
    });

    it('translateError con locale debe usar ese locale', () => {
        const result = translateError('existing.key', Locale.ENGLISH_US);
        expect(result).toBe('Translated');
    });

    it('translateError debe intentar fallback a inglés cuando targetLocale no es ENGLISH_US', () => {
        const { I18nLoaderService } = require('@/shared/services/i18n-loader.service');
        I18nLoaderService.getNestedValue.mockReturnValueOnce(undefined).mockReturnValueOnce('English fallback');
        const result = translateError('some.key', Locale.SPANISH_PE);
        expect(result).toBe('English fallback');
    });

    it('translate debe delegar en translateError', () => {
        expect(translate('existing.key')).toBe('Translated');
    });
});
