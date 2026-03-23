import type { ValidationError } from 'class-validator';
import { ERROR_MESSAGE_KEYS } from '../constants/error-messages.constants';
import { truncateString } from './string.utils';

const VALIDATION_KEYS: Record<string, string> = {
    isDefined: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_REQUIRED,
    isNotEmpty: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_REQUIRED,
    isString: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_MUST_BE_STRING,
    isNumber: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_MUST_BE_NUMBER,
    isInt: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_MUST_BE_INTEGER,
    isArray: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_MUST_BE_ARRAY,
    isDateString: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_MUST_BE_VALID_DATE,
    isEnum: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_INVALID_VALUE,
    isIn: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_INVALID_VALUE,
    min: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_BELOW_MINIMUM,
    max: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_EXCEEDS_MAXIMUM,
    arrayMinSize: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_ARRAY_MIN_SIZE,
    arrayMaxSize: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_ARRAY_MAX_SIZE,
    minLength: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_STRING_MIN_LENGTH,
    maxLength: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_STRING_MAX_LENGTH,
    isEmail: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_MUST_BE_EMAIL,
    isUUID: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_MUST_BE_UUID,
    isBoolean: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_MUST_BE_BOOLEAN,
    whitelistValidation: ERROR_MESSAGE_KEYS.VALIDATION_FIELD_NOT_ALLOWED,
    matches: ERROR_MESSAGE_KEYS.VALIDATION_CURSOR_INVALID_FORMAT,
    atLeastOneBenefitFilter: ERROR_MESSAGE_KEYS.AT_LEAST_ONE_BENEFIT_FILTER_REQUIRED,
    atLeastOneCoverageTypeFilter: ERROR_MESSAGE_KEYS.AT_LEAST_ONE_COVERAGE_TYPE_FILTER_REQUIRED,
    atLeastOneDiagnosticFilter: ERROR_MESSAGE_KEYS.AT_LEAST_ONE_DIAGNOSTIC_FILTER_REQUIRED,
    atLeastOneDiagnosticBenefitFilter: ERROR_MESSAGE_KEYS.AT_LEAST_ONE_DIAGNOSTIC_BENEFIT_FILTER_REQUIRED,
};

const CONSTRAINT_KEYS_WITH_MIN = new Set(['min', 'arrayMinSize', 'minLength']);
const CONSTRAINT_KEYS_WITH_MAX = new Set(['max', 'arrayMaxSize', 'maxLength']);

/** Detalle de validación con keys para que el exception filter traduzca. */
export interface ValidationErrorDetailKey {
    campo: string;
    errorKey: string;
    replacements?: Record<string, string | number>;
}

function extractConstraintValue(message: string): string | undefined {
    const match = message.match(/\d+/);
    return match ? match[0] : undefined;
}

export function extractValidationErrors(errorsArray: ValidationError[]): ValidationErrorDetailKey[] {
    const result: ValidationErrorDetailKey[] = [];

    for (const error of errorsArray) {
        if (error.constraints) {
            const entries = Object.entries(error.constraints).map(([constraintKey, originalMessage]) => {
                const { errorKey, replacements } = getValidationErrorKey(
                    constraintKey,
                    originalMessage,
                    error.property
                );
                return {
                    campo: truncateString(error.property),
                    errorKey,
                    ...(Object.keys(replacements).length > 0 ? { replacements } : {}),
                };
            });
            result.push(...entries);
        }

        if (error.children && error.children.length > 0) {
            const childErrors = extractValidationErrors(error.children);
            result.push(
                ...childErrors.map(child => ({
                    campo: truncateString(`${error.property}.${child.campo}`),
                    errorKey: child.errorKey,
                    ...(child.replacements && Object.keys(child.replacements).length > 0
                        ? { replacements: child.replacements }
                        : {}),
                }))
            );
        }
    }

    return result;
}

/**
 * Devuelve la key i18n y los reemplazos para el mensaje (sin traducir).
 * La traducción la realiza el exception filter.
 */
export function getValidationErrorKey(
    constraintKey: string,
    originalMessage: string,
    property: string
): { errorKey: string; replacements: Record<string, string | number> } {
    const truncatedProperty = truncateString(property);
    const messageKey = VALIDATION_KEYS[constraintKey];
    const replacements: Record<string, string | number> = {
        field: truncatedProperty,
    };

    if (messageKey) {
        const value = extractConstraintValue(originalMessage);
        /* c8 ignore next 2 */
        if (CONSTRAINT_KEYS_WITH_MIN.has(constraintKey)) replacements.min = value ?? '?';
        if (CONSTRAINT_KEYS_WITH_MAX.has(constraintKey)) replacements.max = value ?? '?';
        return { errorKey: messageKey, replacements };
    }

    return { errorKey: originalMessage, replacements: {} };
}
