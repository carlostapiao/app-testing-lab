import * as fs from 'node:fs';
import * as path from 'node:path';
import { Locale } from '../constants/locale.enum';

export interface I18nMessages {
    [key: string]: string | I18nMessages;
}

export class I18nLoaderService {
    private static messagesCache: Map<Locale, I18nMessages> = new Map();

    private static getI18nDir(): string {
        return path.join(__dirname, '../i18n');
    }

    private static getFileNameForLocale(locale: Locale): string {
        const localeMap: Record<Locale, string> = {
            [Locale.ENGLISH_US]: 'en-US.json',
            [Locale.SPANISH_PE]: 'es-PE.json',
        };
        return localeMap[locale] || 'es-PE.json';
    }

    static loadMessages(locale: Locale): I18nMessages {
        const cached = I18nLoaderService.messagesCache.get(locale);
        if (cached !== undefined) {
            return cached;
        }

        const fileName = I18nLoaderService.getFileNameForLocale(locale);
        const filePath = path.join(I18nLoaderService.getI18nDir(), fileName);

        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const messages = JSON.parse(fileContent) as I18nMessages;

            I18nLoaderService.messagesCache.set(locale, messages);

            return messages;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(
                `[I18nLoader] Error loading i18n file for locale ${locale} from ${filePath}: ${errorMessage}`
            );

            return {};
        }
    }

    static getNestedValue(obj: I18nMessages, path: string): string | undefined {
        const keys = path.split('.');
        let current: string | I18nMessages = obj;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = (current as I18nMessages)[key];
            } else {
                return undefined;
            }
        }

        return typeof current === 'string' ? current : undefined;
    }

    static clearCache(): void {
        I18nLoaderService.messagesCache.clear();
    }
}
