import { AsyncLocalStorage } from 'node:async_hooks';
import { DEFAULT_LOCALE, type Locale } from '../constants/locale.enum';

interface I18nContext {
    locale: Locale;
}

export class I18nContextService {
    private static readonly asyncLocalStorage = new AsyncLocalStorage<I18nContext>();

    static run<T>(locale: Locale, callback: () => T): T {
        return I18nContextService.asyncLocalStorage.run({ locale }, callback);
    }

    static getLocale(): Locale {
        const context = I18nContextService.asyncLocalStorage.getStore();
        return context?.locale || DEFAULT_LOCALE;
    }
}
