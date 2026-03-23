import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

const UUID_PATTERN = '\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}\\b';
const UUID_EXAMPLE = 'a7578f1f-86cf-4601-a87b-437af96238e3';

/**
 * Aplica los headers comunes de la API en Swagger (reutilizable en cualquier módulo).
 */
export function ApiCommonHeaders(procesoNegocioExample: string) {
    return applyDecorators(
        ApiHeader({
            name: 'X-Correlation-Id',
            description: 'Identificador de la transacción',
            required: true,
            schema: { type: 'string', pattern: UUID_PATTERN },
            example: UUID_EXAMPLE,
        }),
        ApiHeader({
            name: 'X-Request-Id',
            description: 'Identificador de la petición',
            required: true,
            schema: { type: 'string', pattern: UUID_PATTERN },
            example: UUID_EXAMPLE,
        }),
        ApiHeader({
            name: 'nombreAplicacion',
            description: 'Nombre único de cada aplicación',
            required: true,
            schema: { type: 'string', pattern: '^[a-zA-Z0-9_ ]+$' },
            example: 'OficinaDigital-Afiliado',
        }),
        ApiHeader({
            name: 'procesoNegocio',
            description: 'Proceso de negocio',
            required: true,
            schema: { type: 'string', pattern: '^[a-zA-Z0-9_ ]+$' },
            example: procesoNegocioExample,
        }),
        ApiHeader({
            name: 'usuarioAplicacion',
            description: 'Identidad de usuario',
            required: true,
            schema: { type: 'string', pattern: '^[a-zA-Z0-9_. ]+$' },
            example: 'usuario.aplicacion',
        }),
        ApiHeader({
            name: 'ocp-apim-subscription-key',
            description: 'Clave de suscripción de APIM Azure',
            required: true,
            schema: { type: 'string', pattern: '^[a-zA-Z0-9]+$' },
            example: '888c8b0af6d3333fa03cd8abbe1111ab',
        })
    );
}
