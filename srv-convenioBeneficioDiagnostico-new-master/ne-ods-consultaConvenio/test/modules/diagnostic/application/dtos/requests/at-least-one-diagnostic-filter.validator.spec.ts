import { ERROR_MESSAGE_KEYS } from '@shared/constants/error-messages.constants';
import { AtLeastOneDiagnosticFilterValidator } from '@/modules/diagnostic/application/dtos/requests/at-least-one-diagnostic-filter.validator';

describe('AtLeastOneDiagnosticFilterValidator', () => {
    const validator = new AtLeastOneDiagnosticFilterValidator();

    it('debe devolver false cuando filters es null', () => {
        expect(validator.validate(null)).toBe(false);
    });

    it('debe devolver false cuando filters no es objeto', () => {
        expect(validator.validate(undefined)).toBe(false);
    });

    it('debe devolver false cuando ningún filtro está definido', () => {
        expect(validator.validate({})).toBe(false);
        expect(validator.validate({ codDiagnostico: [] })).toBe(false);
    });

    it('debe devolver true cuando codDiagnostico es array no vacío', () => {
        expect(validator.validate({ codDiagnostico: ['D1'] })).toBe(true);
    });

    it('debe devolver true cuando estRegistro está definido', () => {
        expect(validator.validate({ estRegistro: 'V' })).toBe(true);
    });

    it('debe devolver true cuando codSistema está definido', () => {
        expect(validator.validate({ codSistema: 'NS' })).toBe(true);
    });

    it('defaultMessage debe devolver la clave de error', () => {
        expect(validator.defaultMessage()).toBe(ERROR_MESSAGE_KEYS.AT_LEAST_ONE_DIAGNOSTIC_FILTER_REQUIRED);
    });
});
