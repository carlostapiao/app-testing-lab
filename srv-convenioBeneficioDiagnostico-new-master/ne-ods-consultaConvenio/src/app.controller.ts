import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * Controlador raíz para validar que el microservicio está en ejecución.
 */
@Controller({ path: '', version: '1.0.0' })
@ApiTags('Estado del servicio')
export class AppController {
    private static readonly SERVICE_NAME = 'srv-ms-oc-ne-consulta-convenioBeneficioDiagnosticos-ssd';
    private static readonly VERSION = '1.0.0';

    @Get()
    @ApiOperation({
        summary: 'Estado del microservicio',
        description: 'Devuelve un mensaje de validación para comprobar que el microservicio está en ejecución.',
    })
    @ApiResponse({ status: 200, description: 'Microservicio operativo' })
    getRoot(): { status: string; message: string; service: string; version: string } {
        return {
            status: 'ok',
            message: 'Microservicio de consulta de convenios beneficio diagnóstico en ejecución',
            service: AppController.SERVICE_NAME,
            version: AppController.VERSION,
        };
    }
}
