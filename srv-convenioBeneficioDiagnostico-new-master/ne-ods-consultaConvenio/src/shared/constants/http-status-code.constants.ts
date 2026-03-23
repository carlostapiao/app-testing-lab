import { ERROR_MESSAGE_KEYS } from '@shared/services/translation.service';

function getErrorResponseKeys(code: string, messageKey: string, descriptionKey: string) {
    return {
        CODE: code,
        MESSAGE_KEY: messageKey,
        DESCRIPTION_KEY: descriptionKey,
    };
}

export const APP_ERROR_RESPONSES = {
    get BAD_REQUEST() {
        return getErrorResponseKeys(
            'F_NEG_001',
            ERROR_MESSAGE_KEYS.BAD_REQUEST_MESSAGE,
            ERROR_MESSAGE_KEYS.BAD_REQUEST_DESCRIPTION
        );
    },
    get NOT_FOUND() {
        return getErrorResponseKeys(
            'F_NEG_002',
            ERROR_MESSAGE_KEYS.NOT_FOUND_MESSAGE,
            ERROR_MESSAGE_KEYS.NOT_FOUND_DESCRIPTION
        );
    },
    get UNAUTHORIZED() {
        return getErrorResponseKeys(
            'F_NEG_003',
            ERROR_MESSAGE_KEYS.UNAUTHORIZED_MESSAGE,
            ERROR_MESSAGE_KEYS.UNAUTHORIZED_DESCRIPTION
        );
    },
    get FORBIDDEN() {
        return getErrorResponseKeys(
            'F_NEG_004',
            ERROR_MESSAGE_KEYS.FORBIDDEN_MESSAGE,
            ERROR_MESSAGE_KEYS.FORBIDDEN_DESCRIPTION
        );
    },
    get INTERNAL_SERVER_ERROR() {
        return getErrorResponseKeys(
            'T_MS_001',
            ERROR_MESSAGE_KEYS.INTERNAL_SERVER_ERROR_MESSAGE,
            ERROR_MESSAGE_KEYS.INTERNAL_SERVER_ERROR_DESCRIPTION
        );
    },
    get SERVICE_UNAVAILABLE() {
        return getErrorResponseKeys(
            'T_MS_002',
            ERROR_MESSAGE_KEYS.SERVICE_UNAVAILABLE_MESSAGE,
            ERROR_MESSAGE_KEYS.SERVICE_UNAVAILABLE_DESCRIPTION
        );
    },
    get UNEXPECTED_ERROR() {
        return getErrorResponseKeys(
            'T_MS_003',
            ERROR_MESSAGE_KEYS.UNEXPECTED_ERROR_MESSAGE,
            ERROR_MESSAGE_KEYS.UNEXPECTED_ERROR_DESCRIPTION
        );
    },
} as const;

export const GENERIC_ERROR_MESSAGE_KEY = ERROR_MESSAGE_KEYS.GENERIC_ERROR_MESSAGE;
