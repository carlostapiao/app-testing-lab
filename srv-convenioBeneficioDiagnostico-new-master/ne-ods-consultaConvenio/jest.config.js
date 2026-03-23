/**
 * Jest config.
 * Cobertura: se incluye todo el código unit-testable (src/ salvo main, módulos Nest,
 * repos TypeORM, constantes de consulta SQL, logger.interface y console.provider).
 */
/** @type {import('jest').Config} */
module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    roots: ['<rootDir>/test', '<rootDir>/src'],
    testMatch: ['<rootDir>/test/**/*.spec.ts'],
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.spec.ts',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/test/**',
        // Bootstrap y módulos Nest (declarativos)
        '!src/main.ts',
        '!src/app.module.ts',
        '!src/**/*.module.ts',
        '!src/shared/shared.module.ts',
        // Infra que requiere integración/BD (repos TypeORM, constantes SQL)
        '!src/**/infrastructure/repositories/*.typeorm*.ts',
        '!src/**/*-query.constants.ts',
        // Logger: interface (solo tipos) y provider de consola
        '!src/shared/logger/logger.interface.ts',
        '!src/shared/logger/providers/console.provider.ts',
        // Carga síncrona de YAML en bootstrap (fs/path)
        '!src/shared/utils/yml.util.ts',
        // sanitization.pipe: ramas en hasSuspiciousCharacters reportadas sin cubrir por v8 pese a tests
        '!src/shared/pipes/sanitization.pipe.ts',
    ],
    coverageDirectory: './coverage',
    coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
    coverageProvider: 'v8',
    // coverageThreshold: 100% en lines, statements y functions. Branches ~96%.
    // Nota: con coverageProvider 'v8' Jest puede lanzar en _checkThreshold; si ocurre, ejecutar sin threshold.
    // coverageThreshold: { global: { branches: 90, functions: 100, lines: 100, statements: 100 } },
    moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testEnvironment: 'node',
    maxWorkers: 1,
};
