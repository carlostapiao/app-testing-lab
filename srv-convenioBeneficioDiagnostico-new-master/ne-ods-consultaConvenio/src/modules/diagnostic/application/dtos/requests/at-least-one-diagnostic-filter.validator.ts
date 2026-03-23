import { ERROR_MESSAGE_KEYS } from '@shared/constants/error-messages.constants';
import { Validate, ValidatorConstraint, type ValidatorConstraintInterface } from 'class-validator';
import type { DiagnosticFiltersDto } from './diagnostic-filters.dto';

/**
 * Valida que al menos un filtro de negocio (distinto de la paginación) esté definido y no vacío.
 * Filtros considerados: codDiagnostico (array no vacío), estRegistro, codSistema.
 */
@ValidatorConstraint({ name: 'atLeastOneDiagnosticFilter', async: false })
export class AtLeastOneDiagnosticFilterValidator implements ValidatorConstraintInterface {
    validate(filters: DiagnosticFiltersDto | undefined): boolean {
        if (filters == null || typeof filters !== 'object') {
            return false;
        }
        const hasCodDiagnostico = Array.isArray(filters.codDiagnostico) && filters.codDiagnostico.length > 0;
        const hasEstRegistro = hasNonEmptyString(filters.estRegistro);
        const hasCodSistema = hasNonEmptyString(filters.codSistema);
        return hasCodDiagnostico || hasEstRegistro || hasCodSistema;
    }

    defaultMessage(): string {
        return ERROR_MESSAGE_KEYS.AT_LEAST_ONE_DIAGNOSTIC_FILTER_REQUIRED;
    }
}

function hasNonEmptyString(value: unknown): boolean {
    return typeof value === 'string' && value.trim() !== '';
}

/** Aplicar en la propiedad filters del request para exigir al menos un filtro de negocio. */
export const ValidateAtLeastOneDiagnosticFilter = () => Validate(AtLeastOneDiagnosticFilterValidator);
