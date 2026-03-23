export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat', // Nueva funcionalidad
                'fix', // Corrección de bug
                'docs', // Documentación
                'style', // Formato (no afecta código)
                'refactor', // Refactorización
                'perf', // Mejora de rendimiento
                'test', // Tests
                'build', // Sistema de build
                'ci', // CI/CD
                'chore', // Tareas de mantenimiento
                'revert', // Revertir commit
            ],
        ],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],
        'scope-case': [2, 'always', 'lower-case'],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'header-max-length': [2, 'always', 100],
    },
};
