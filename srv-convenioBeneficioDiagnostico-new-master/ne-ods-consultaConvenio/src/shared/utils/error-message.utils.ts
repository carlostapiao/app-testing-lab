import type { Locale } from '../constants/locale.enum';
import { I18nContextService } from '../services/i18n-context.service';
import { translateError } from '../services/translation.service';

export function replacePlaceholders(message: string, replacements: Record<string, string | number>): string {
    let result = message;
    for (const [key, value] of Object.entries(replacements)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
    return result;
}

export function translateAndFormat(
    messageKey: string,
    replacements: Record<string, string | number> = {},
    locale?: Locale
): string {
    const targetLocale = locale || I18nContextService.getLocale();
    const translated = translateError(messageKey, targetLocale);
    return replacePlaceholders(translated, replacements);
}
