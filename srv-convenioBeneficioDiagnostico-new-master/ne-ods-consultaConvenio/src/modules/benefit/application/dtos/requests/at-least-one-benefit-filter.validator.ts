import { ERROR_MESSAGE_KEYS } from '@shared/constants/error-messages.constants';
import { Validate, ValidatorConstraint, type ValidatorConstraintInterface } from 'class-validator';
import type { BenefitFiltersDto } from './benefit-filters.dto';

/**
 * Valida que al menos un filtro de negocio (distinto de la paginación) esté definido y no vacío.
 * Filtros considerados: codCompania, codSistema, codTipoCobertura, codSubtipoCobertura, estRegistro.
 */
@ValidatorConstraint({ name: 'atLeastOneBenefitFilter', async: false })
export class AtLeastOneBenefitFilterValidator implements ValidatorConstraintInterface {
    validate(filters: BenefitFiltersDto | undefined): boolean {
        if (filters == null || typeof filters !== 'object') {
            return false;
        }
        const hasCodCompania = hasNonEmptyString(filters.codCompania);
        const hasCodSistema = hasNonEmptyString(filters.codSistema);
        const hasCodTipoCobertura = hasNonEmptyString(filters.codTipoCobertura);
        const hasCodSubtipoCobertura = hasNonEmptyString(filters.codSubtipoCobertura);
        const hasEstRegistro = hasNonEmptyString(filters.estRegistro);
        return hasCodCompania || hasCodSistema || hasCodTipoCobertura || hasCodSubtipoCobertura || hasEstRegistro;
    }

    defaultMessage(): string {
        return ERROR_MESSAGE_KEYS.AT_LEAST_ONE_BENEFIT_FILTER_REQUIRED;
    }
}

function hasNonEmptyString(value: unknown): boolean {
    return typeof value === 'string' && value.trim() !== '';
}

/** Aplicar en la propiedad filters del request para exigir al menos un filtro de negocio. */
export const ValidateAtLeastOneBenefitFilter = () => Validate(AtLeastOneBenefitFilterValidator);
