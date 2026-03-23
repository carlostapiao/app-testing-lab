import { ERROR_MESSAGE_KEYS } from '@shared/constants/error-messages.constants';
import { AtLeastOneDiagnosticBenefitFilterValidator } from '@/modules/diagnostic/application/dtos/requests/at-least-one-diagnostic-benefit-filter.validator';

describe('AtLeastOneDiagnosticBenefitFilterValidator', () => {
    const validator = new AtLeastOneDiagnosticBenefitFilterValidator();

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

    it('debe devolver true cuando codSistemaDiagnosticoBeneficio está definido', () => {
        expect(validator.validate({ codSistemaDiagnosticoBeneficio: 'SDB' })).toBe(true);
    });

    it('debe devolver true cuando codDiagnostico es array no vacío', () => {
        expect(validator.validate({ codDiagnostico: ['D1'] })).toBe(true);
    });

    it('debe devolver true cuando codBeneficio está definido', () => {
        expect(validator.validate({ codBeneficio: 'B1' })).toBe(true);
    });

    it('debe devolver true cuando estDiagnosticoBeneficio está definido', () => {
        expect(validator.validate({ estDiagnosticoBeneficio: 'V' })).toBe(true);
    });

    it('defaultMessage debe devolver la clave de error', () => {
        expect(validator.defaultMessage()).toBe(ERROR_MESSAGE_KEYS.AT_LEAST_ONE_DIAGNOSTIC_BENEFIT_FILTER_REQUIRED);
    });
});
