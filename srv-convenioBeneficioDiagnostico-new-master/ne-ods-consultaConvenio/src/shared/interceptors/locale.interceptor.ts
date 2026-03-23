import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { HttpHeaders } from '../constants/http-headers.constants';
import { DEFAULT_LOCALE, Locale } from '../constants/locale.enum';
import { I18nContextService } from '../services/i18n-context.service';

@Injectable()
export class LocaleInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const locale = this.extractLocaleFromHeader(request);

        return new Observable(subscriber => {
            I18nContextService.run(locale, () => {
                const source$ = next.handle();
                source$.subscribe({
                    next: value => subscriber.next(value),
                    error: error => subscriber.error(error),
                    complete: () => subscriber.complete(),
                });
            });
        });
    }

    private extractLocaleFromHeader(request: FastifyRequest): Locale {
        const acceptLanguage = request.headers[HttpHeaders.ACCEPT_LANGUAGE];

        if (!acceptLanguage) return DEFAULT_LOCALE;

        const locales = this.parseAcceptLanguage(acceptLanguage as string);

        for (const lang of locales) {
            const normalized = this.normalizeLocale(lang);
            if (normalized) return normalized;
        }

        return DEFAULT_LOCALE;
    }

    private parseAcceptLanguage(acceptLanguage: string): string[] {
        const languages: Array<{ lang: string; q: number }> = [];

        const parts = acceptLanguage.split(',');

        for (const part of parts) {
            const trimmed = part.trim();
            const [lang, qValue] = trimmed.split(';');

            let quality = 1.0;
            if (qValue) {
                const qMatch = qValue.match(/q=([\d.]+)/);
                if (qMatch) {
                    quality = parseFloat(qMatch[1]);
                }
            }

            languages.push({ lang: lang.trim().toLowerCase(), q: quality });
        }

        languages.sort((a, b) => b.q - a.q);

        return languages.map(l => l.lang);
    }

    private normalizeLocale(langTag: string): Locale | null {
        const normalized = langTag.toLowerCase();
        if (normalized === 'en-us') return Locale.ENGLISH_US;
        if (normalized === 'es-pe') return Locale.SPANISH_PE;
        return null;
    }
}
