import { ERROR_MESSAGE_KEYS } from '@shared/constants/error-messages.constants';
import { AtLeastOneBenefitFilterValidator } from '@/modules/benefit/application/dtos/requests/at-least-one-benefit-filter.validator';

describe('AtLeastOneBenefitFilterValidator', () => {
    const validator = new AtLeastOneBenefitFilterValidator();

    it('debe devolver false cuando filters es null', () => {
        expect(validator.validate(null)).toBe(false);
    });

    it('debe devolver false cuando filters no es objeto', () => {
        expect(validator.validate(undefined)).toBe(false);
        expect(validator.validate('string' as never)).toBe(false);
    });

    it('debe devolver false cuando ningún filtro está definido o está vacío', () => {
        expect(validator.validate({})).toBe(false);
        expect(validator.validate({ codCompania: '', codSistema: '  ' })).toBe(false);
    });

    it('debe devolver true cuando codCompania está definido y no vacío', () => {
        expect(validator.validate({ codCompania: '1' })).toBe(true);
    });

    it('debe devolver true cuando codSistema está definido', () => {
        expect(validator.validate({ codSistema: 'NS' })).toBe(true);
    });

    it('debe devolver true cuando codTipoCobertura está definido', () => {
        expect(validator.validate({ codTipoCobertura: '4' })).toBe(true);
    });

    it('debe devolver true cuando codSubtipoCobertura está definido', () => {
        expect(validator.validate({ codSubtipoCobertura: '100' })).toBe(true);
    });

    it('debe devolver true cuando estRegistro está definido', () => {
        expect(validator.validate({ estRegistro: 'V' })).toBe(true);
    });

    it('defaultMessage debe devolver la clave de error', () => {
        expect(validator.defaultMessage()).toBe(ERROR_MESSAGE_KEYS.AT_LEAST_ONE_BENEFIT_FILTER_REQUIRED);
    });
});
