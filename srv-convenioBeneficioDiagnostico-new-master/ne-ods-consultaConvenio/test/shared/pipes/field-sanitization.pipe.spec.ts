import { FieldSanitizationPipe } from '@/shared/pipes/field-sanitization.pipe';

describe('FieldSanitizationPipe', () => {
    let pipe: FieldSanitizationPipe;

    beforeEach(() => {
        pipe = new FieldSanitizationPipe();
    });

    it('debe devolver el valor cuando es seguro', () => {
        expect(pipe.transform('safe')).toBe('safe');
        expect(pipe.transform(123)).toBe(123);
    });

    it('debe delegar en SanitizationPipe (null/undefined pasan)', () => {
        expect(pipe.transform(null)).toBe(null);
        expect(pipe.transform(undefined)).toBe(undefined);
    });
});
