import { BadRequestException } from '@nestjs/common';
import { SanitizationPipe } from '@/shared/pipes/sanitization.pipe';

jest.mock('@/shared/services/translation.service', () => ({
    translate: jest.fn((key: string) => key),
    ERROR_MESSAGE_KEYS: {},
}));
jest.mock('@/shared/utils/error-message.utils', () => ({
    translateAndFormat: jest.fn((_key: string, params?: Record<string, unknown>) => JSON.stringify(params ?? {})),
}));

describe('SanitizationPipe', () => {
    let pipe: SanitizationPipe;

    beforeEach(() => {
        pipe = new SanitizationPipe();
    });

    it('debe devolver null o undefined sin modificar', () => {
        expect(pipe.transform(null)).toBe(null);
        expect(pipe.transform(undefined)).toBe(undefined);
    });

    it('debe aceptar string segura', () => {
        expect(pipe.transform('hello')).toBe('hello');
    });

    it('debe rechazar string con < o >', () => {
        expect(() => pipe.transform('a < b')).toThrow(BadRequestException);
        expect(() => pipe.transform('<script>')).toThrow(BadRequestException);
    });

    it('debe aceptar número válido', () => {
        expect(pipe.transform(42)).toBe(42);
    });

    it('debe rechazar número no finito', () => {
        expect(() => pipe.transform(Number.NaN)).toThrow(BadRequestException);
        expect(() => pipe.transform(Infinity)).toThrow(BadRequestException);
    });

    it('debe aceptar array de valores seguros', () => {
        expect(pipe.transform(['a', 'b'])).toEqual(['a', 'b']);
    });

    it('debe aceptar objeto con valores seguros', () => {
        expect(pipe.transform({ name: 'test', count: 1 })).toEqual({ name: 'test', count: 1 });
    });

    it('debe rechazar string que exceda maxStringLength', () => {
        const long = 'x'.repeat(10001);
        expect(() => pipe.transform(long)).toThrow(BadRequestException);
    });

    it('debe rechazar array con más de maxArrayLength elementos', () => {
        const arr = Array.from({ length: 1001 }, (_, i) => String(i));
        expect(() => pipe.transform(arr)).toThrow(BadRequestException);
    });

    it('debe rechazar objeto con más de 100 propiedades', () => {
        const obj: Record<string, string> = {};
        for (let i = 0; i < 101; i++) obj[`$k${i}`] = 'v';
        expect(() => pipe.transform(obj)).toThrow(BadRequestException);
    });

    it('debe rechazar profundidad excesiva', () => {
        let nested: unknown = 'leaf';
        for (let i = 0; i < 11; i++) nested = { inner: nested };
        expect(() => pipe.transform(nested)).toThrow(BadRequestException);
    });

    it('debe rechazar string con patrón peligroso (script)', () => {
        expect(() => pipe.transform('<script>alert(1)</script>')).toThrow(BadRequestException);
    });

    it('debe rechazar string con javascript:', () => {
        expect(() => pipe.transform('javascript:void(0)')).toThrow(BadRequestException);
    });

    it('debe rechazar string con comillas dobles repetidas (sospechoso)', () => {
        expect(() => pipe.transform('normal""injection')).toThrow(BadRequestException);
    });

    it('debe rechazar string con -- repetido (SQL comment)', () => {
        expect(() => pipe.transform('value---comment')).toThrow(BadRequestException);
    });

    it('debe rechazar string con caracteres de inyección', () => {
        expect(() => pipe.transform('a;b|c')).toThrow(BadRequestException);
    });

    it('debe rechazar key con < en objeto', () => {
        expect(() => pipe.transform({ 'key<': 'v' })).toThrow(BadRequestException);
    });

    it('debe rechazar elemento de array inválido y lanzar con index', () => {
        expect(() => pipe.transform(['ok', '<script>'])).toThrow(BadRequestException);
    });

    it('debe rechazar propiedad de objeto con valor inválido', () => {
        expect(() => pipe.transform({ a: 'ok', b: 1, c: '<' })).toThrow(BadRequestException);
    });

    it('debe rechazar número fuera de rango', () => {
        expect(() => pipe.transform(Number.MAX_SAFE_INTEGER + 1)).toThrow(BadRequestException);
    });

    it('debe rechazar objeto con key que excede maxStringLength', () => {
        const longKey = 'k'.repeat(10001);
        expect(() => pipe.transform({ [longKey]: 'v' })).toThrow(BadRequestException);
    });

    it('debe rechazar objeto con key que contiene patrón peligroso (javascript:)', () => {
        expect(() => pipe.transform({ 'javascript:key': 'v' })).toThrow(BadRequestException);
    });

    it('debe rechazar objeto con key con caracteres sospechosos (comillas dobles)', () => {
        expect(() => pipe.transform({ 'key""x': 'v' })).toThrow(BadRequestException);
    });

    it('debe rechazar objeto con key con caracteres de control o inyección', () => {
        expect(() => pipe.transform({ 'a;b': 'v' })).toThrow(BadRequestException);
    });

    it('debe devolver valor sin modificar cuando es boolean', () => {
        expect(pipe.transform(true)).toBe(true);
        expect(pipe.transform(false)).toBe(false);
    });

    it('debe rechazar key con carácter | (hasSuspiciousCharacters)', () => {
        expect(() => pipe.transform({ 'a|b': 'v' })).toThrow(BadRequestException);
    });

    it('debe aceptar key válida sin caracteres sospechosos', () => {
        expect(pipe.transform({ validKey123: 'v' })).toEqual({ validKey123: 'v' });
    });

    it('debe rechazar key con backtick (hasSuspiciousCharacters)', () => {
        expect(() => pipe.transform({ 'key`inject': 'v' })).toThrow(BadRequestException);
    });

    it('debe rechazar key con paréntesis en patrón inyección', () => {
        expect(() => pipe.transform({ 'a(b)c': 'v' })).toThrow(BadRequestException);
    });
});
