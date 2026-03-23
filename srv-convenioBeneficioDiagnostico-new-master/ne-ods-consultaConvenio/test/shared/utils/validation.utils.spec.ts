import type { ValidationError } from 'class-validator';
import { extractValidationErrors, getValidationErrorKey } from '@/shared/utils/validation.utils';

describe('validation.utils', () => {
    describe('getValidationErrorKey', () => {
        it('debe mapear isNotEmpty a key de campo requerido', () => {
            const result = getValidationErrorKey('isNotEmpty', 'message', 'fieldName');
            expect(result.errorKey).toBeDefined();
            expect(result.replacements?.field).toBe('fieldName');
        });

        it('debe mapear min y extraer valor del mensaje', () => {
            const result = getValidationErrorKey('min', 'min allowed is 5', 'limit');
            expect(result.replacements?.min).toBeDefined();
        });

        it('debe mapear max y extraer valor del mensaje', () => {
            const result = getValidationErrorKey('max', 'max allowed is 100', 'limit');
            expect(result.replacements?.max).toBeDefined();
        });

        it('debe mapear maxLength y extraer valor', () => {
            const result = getValidationErrorKey('maxLength', 'max length is 50', 'name');
            expect(result.replacements?.max).toBeDefined();
        });

        it('debe devolver originalMessage si la constraint no está en VALIDATION_KEYS', () => {
            const result = getValidationErrorKey('unknownConstraint', 'custom msg', 'prop');
            expect(result.errorKey).toBe('custom msg');
        });

        it('debe mapear arrayMaxSize (CONSTRAINT_KEYS_WITH_MAX) y extraer valor', () => {
            const result = getValidationErrorKey(
                'arrayMaxSize',
                'array must contain no more than 10 elements',
                'items'
            );
            expect(result.replacements?.max).toBeDefined();
        });

        it('debe mapear minLength (CONSTRAINT_KEYS_WITH_MIN) y extraer valor', () => {
            const result = getValidationErrorKey('minLength', 'min length is 2', 'name');
            expect(result.replacements?.min).toBeDefined();
        });
    });

    describe('extractValidationErrors', () => {
        it('debe extraer errores de constraints', () => {
            const errors: ValidationError[] = [
                {
                    property: 'filters',
                    constraints: { isNotEmpty: 'filters should not be empty' },
                    children: [],
                } as ValidationError,
            ];
            const result = extractValidationErrors(errors);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].campo).toBeDefined();
            expect(result[0].errorKey).toBeDefined();
        });

        it('debe procesar children recursivamente', () => {
            const errors: ValidationError[] = [
                {
                    property: 'parent',
                    children: [
                        {
                            property: 'child',
                            constraints: { isString: 'child must be string' },
                            children: [],
                        } as ValidationError,
                    ],
                } as ValidationError,
            ];
            const result = extractValidationErrors(errors);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].campo).toContain('parent');
        });

        it('debe incluir replacements en el detalle cuando existen', () => {
            const errors: ValidationError[] = [
                {
                    property: 'limit',
                    constraints: { min: 'min allowed is 1' },
                    children: [],
                } as ValidationError,
            ];
            const result = extractValidationErrors(errors);
            expect(result[0].replacements).toBeDefined();
            expect(Object.keys(result[0].replacements ?? {}).length).toBeGreaterThan(0);
        });

        it('debe incluir replacements en children cuando existen', () => {
            const errors: ValidationError[] = [
                {
                    property: 'p',
                    children: [
                        {
                            property: 'c',
                            constraints: { max: 'max is 10' },
                            children: [],
                        } as ValidationError,
                    ],
                } as ValidationError,
            ];
            const result = extractValidationErrors(errors);
            expect(result.some(r => r.replacements && Object.keys(r.replacements).length > 0)).toBe(true);
        });

        it('debe incluir replacements en child cuando child tiene replacements', () => {
            const errors: ValidationError[] = [
                {
                    property: 'parent',
                    constraints: {},
                    children: [
                        {
                            property: 'child',
                            constraints: { minLength: 'min length is 2' },
                            children: [],
                        } as ValidationError,
                    ],
                } as ValidationError,
            ];
            const result = extractValidationErrors(errors);
            const withReplacements = result.filter(r => r.replacements && Object.keys(r.replacements).length > 0);
            expect(withReplacements.length).toBeGreaterThan(0);
        });

        it('debe incluir replacements en child cuando child tiene replacements con longitud > 0', () => {
            const errors: ValidationError[] = [
                {
                    property: 'parent',
                    constraints: {},
                    children: [
                        {
                            property: 'child',
                            constraints: { max: 'max is 100' },
                            children: [],
                        } as ValidationError,
                    ],
                } as ValidationError,
            ];
            const result = extractValidationErrors(errors);
            const childResult = result.find(r => r.campo.includes('child'));
            expect(childResult?.replacements).toBeDefined();
            expect(Object.keys(childResult?.replacements ?? {}).length).toBeGreaterThan(0);
        });

        it('no incluye replacements cuando child tiene replacements vacío (rama length > 0 false)', () => {
            const errors: ValidationError[] = [
                {
                    property: 'parent',
                    constraints: {},
                    children: [
                        {
                            property: 'child',
                            constraints: { unknownConstraint: 'custom message' },
                            children: [],
                        } as ValidationError,
                    ],
                } as ValidationError,
            ];
            const result = extractValidationErrors(errors);
            const childEntry = result.find(r => r.campo.includes('child'));
            expect(childEntry).toBeDefined();
            expect(childEntry?.errorKey).toBe('custom message');
        });
    });
});
