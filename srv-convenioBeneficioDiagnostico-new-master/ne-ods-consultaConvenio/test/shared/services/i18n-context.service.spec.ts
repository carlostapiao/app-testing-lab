import { DEFAULT_LOCALE, Locale } from '@/shared/constants/locale.enum';
import { I18nContextService } from '@/shared/services/i18n-context.service';

describe('I18nContextService', () => {
    it('run debe ejecutar el callback con el locale en contexto', () => {
        const result = I18nContextService.run(Locale.ENGLISH_US, () => {
            expect(I18nContextService.getLocale()).toBe(Locale.ENGLISH_US);
            return 'ok';
        });
        expect(result).toBe('ok');
    });

    it('getLocale debe devolver DEFAULT_LOCALE cuando no hay contexto', () => {
        expect(I18nContextService.getLocale()).toBe(DEFAULT_LOCALE);
    });

    it('getLocale debe devolver el locale del contexto tras run', () => {
        I18nContextService.run(Locale.SPANISH_PE, () => {
            expect(I18nContextService.getLocale()).toBe(Locale.SPANISH_PE);
        });
        expect(I18nContextService.getLocale()).toBe(DEFAULT_LOCALE);
    });
});
