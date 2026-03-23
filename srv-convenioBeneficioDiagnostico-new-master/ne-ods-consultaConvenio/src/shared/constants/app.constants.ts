export const INFRASTRUCTURE_CONSTANTS = {
    ENVIRONMENT: {
        DEVELOPMENT: 'desa',
        TEST: 'test',
        PRODUCTION: 'prod',
    },

    SERVER: {
        DEFAULT_PORT: 4040,
    },

    DATABASE: {
        DEFAULT_PORT: 1433,
    },

    REDIS: {
        DEFAULT_HOST: 'localhost',
        DEFAULT_PORT: 6379,
        DEFAULT_TTL: 3600,
    },

    I18N: {
        DEFAULT_LOCALE: 'es-PE',
    },
} as const;
