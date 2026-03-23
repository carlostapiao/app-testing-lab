import { ERROR_MESSAGE_KEYS } from '@shared/constants/error-messages.constants';
import { Validate, ValidatorConstraint, type ValidatorConstraintInterface } from 'class-validator';
import type { DiagnosticBenefitFiltersDto } from './diagnostic-benefit-filters.dto';

/**
 * Valida que al menos un filtro esté definido y no vacío.
 * Filtros: codSistemaDiagnosticoBeneficio, codDiagnostico (array), codBeneficio, estDiagnosticoBeneficio.
 */
@ValidatorConstraint({ name: 'atLeastOneDiagnosticBenefitFilter', async: false })
export class AtLeastOneDiagnosticBenefitFilterValidator implements ValidatorConstraintInterface {
    validate(filters: DiagnosticBenefitFiltersDto | undefined): boolean {
        if (filters == null || typeof filters !== 'object') {
            return false;
        }
        const hasCodSistema = hasNonEmptyString(filters.codSistemaDiagnosticoBeneficio);
        const hasCodDiagnostico = Array.isArray(filters.codDiagnostico) && filters.codDiagnostico.length > 0;
        const hasCodBeneficio = hasNonEmptyString(filters.codBeneficio);
        const hasEst = hasNonEmptyString(filters.estDiagnosticoBeneficio);
        return hasCodSistema || hasCodDiagnostico || hasCodBeneficio || hasEst;
    }

    defaultMessage(): string {
        return ERROR_MESSAGE_KEYS.AT_LEAST_ONE_DIAGNOSTIC_BENEFIT_FILTER_REQUIRED;
    }
}

function hasNonEmptyString(value: unknown): boolean {
    return typeof value === 'string' && value.trim() !== '';
}

export const ValidateAtLeastOneDiagnosticBenefitFilter = () => Validate(AtLeastOneDiagnosticBenefitFilterValidator);
