import * as fs from 'node:fs';
import { Locale } from '@shared/constants/locale.enum';
import { I18nLoaderService, type I18nMessages } from '@/shared/services/i18n-loader.service';

describe('I18nLoaderService', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    afterEach(() => {
        I18nLoaderService.clearCache();
        consoleSpy.mockClear();
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });

    describe('loadMessages', () => {
        it('debe cargar mensajes y cachear por locale', () => {
            const messages = I18nLoaderService.loadMessages(Locale.SPANISH_PE);
            expect(typeof messages).toBe('object');
            const cached = I18nLoaderService.loadMessages(Locale.SPANISH_PE);
            expect(cached).toBe(messages);
        });

        it('debe devolver {} y loguear cuando readFileSync falla', () => {
            const readSpy = jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
                throw new Error('File not found');
            });
            const result = I18nLoaderService.loadMessages(Locale.ENGLISH_US);
            expect(result).toEqual({});
            expect(consoleSpy).toHaveBeenCalled();
            readSpy.mockRestore();
        });

        it('debe usar String(error) cuando error no es instancia de Error', () => {
            const readSpy = jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
                throw 'string error';
            });
            const result = I18nLoaderService.loadMessages(Locale.ENGLISH_US);
            expect(result).toEqual({});
            readSpy.mockRestore();
        });

        it('debe usar fallback es-PE.json cuando locale no está en localeMap (getFileNameForLocale)', () => {
            I18nLoaderService.clearCache();
            const messages = I18nLoaderService.loadMessages('xx' as Locale);
            expect(typeof messages).toBe('object');
        });
    });

    describe('getNestedValue', () => {
        it('debe devolver el valor string en la ruta', () => {
            const obj = { a: { b: { c: 'value' } } };
            expect(I18nLoaderService.getNestedValue(obj, 'a.b.c')).toBe('value');
        });

        it('debe devolver undefined cuando la clave no existe', () => {
            const obj = { a: { b: 'x' } };
            expect(I18nLoaderService.getNestedValue(obj, 'a.b.missing')).toBeUndefined();
        });

        it('debe devolver undefined cuando el valor final no es string', () => {
            const obj = { a: { b: { c: 123 } } } as unknown as I18nMessages;
            expect(I18nLoaderService.getNestedValue(obj, 'a.b.c')).toBeUndefined();
        });

        it('debe devolver undefined cuando la ruta está vacía o no coincide', () => {
            const obj = { a: {} };
            expect(I18nLoaderService.getNestedValue(obj, 'x')).toBeUndefined();
        });
    });

    describe('clearCache', () => {
        it('debe limpiar la caché', () => {
            I18nLoaderService.loadMessages(Locale.SPANISH_PE);
            I18nLoaderService.clearCache();
            const messages = I18nLoaderService.loadMessages(Locale.SPANISH_PE);
            expect(typeof messages).toBe('object');
        });
    });
});
