import { ERROR_MESSAGE_KEYS } from '../constants/error-messages.constants';
import { Locale } from '../constants/locale.enum';
import { I18nContextService } from './i18n-context.service';
import { I18nLoaderService } from './i18n-loader.service';

export function translateError(messageKey: string, locale?: Locale): string {
    const targetLocale = locale || I18nContextService.getLocale();
    const messages = I18nLoaderService.loadMessages(targetLocale);
    const translated = I18nLoaderService.getNestedValue(messages, messageKey);

    if (translated) {
        return translated;
    }

    if (targetLocale !== Locale.ENGLISH_US) {
        const englishMessages = I18nLoaderService.loadMessages(Locale.ENGLISH_US);
        const englishTranslation = I18nLoaderService.getNestedValue(englishMessages, messageKey);
        if (englishTranslation) {
            return englishTranslation;
        }
    }

    return messageKey;
}

export function translate(messageKey: string, locale?: Locale): string {
    return translateError(messageKey, locale);
}

export { ERROR_MESSAGE_KEYS };
