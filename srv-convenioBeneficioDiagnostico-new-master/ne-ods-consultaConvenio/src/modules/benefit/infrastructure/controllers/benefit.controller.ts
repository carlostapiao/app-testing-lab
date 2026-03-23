import { BenefitSearchRequestDto } from '@modules/benefit/application/dtos/requests/benefit-search-request.dto';
import { BenefitSearchResponseDto } from '@modules/benefit/application/dtos/responses/benefit-search-response.dto';
import { QueryBenefitsUseCase } from '@modules/benefit/application/use-cases/query-benefits.use-case';
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { HttpHeaders } from '@shared/constants/http-headers.constants';
import { ApiCommonHeaders } from '@shared/decorators/api-common-headers.decorator';
import { RequestHeader } from '@shared/decorators/request-header.decorator';
import { HeadersDto } from '@shared/dtos/headers.dto';
import { RequestSmugglingGuard } from '@shared/guards/request-smuggling.guard';
import { DuplicatePropertiesInterceptor } from '@shared/interceptors/duplicate-properties.interceptor';
import { LoggerService } from '@shared/logger/logger.service';

/**
 * Controlador REST para consulta de beneficios (convenio.Mae_Beneficio).
 *
 * @security Protegido contra HTTP Request Smuggling
 * @security Sanitización global de entrada activa
 */
@Controller({ path: 'beneficios', version: '1.0.0' })
@ApiTags('Convenios de Beneficio')
@UseInterceptors(DuplicatePropertiesInterceptor)
@UseGuards(RequestSmugglingGuard)
export class BenefitController {
    private readonly logger = this.loggerService.withContext(BenefitController.name);

    constructor(
        private readonly loggerService: LoggerService,
        private readonly queryBenefitsUseCase: QueryBenefitsUseCase
    ) {}

    /**
     * Consulta de beneficios
     * POST /beneficios
     */
    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Consulta de beneficios',
        description: `Listado de beneficios con paginación keyset. Filtros opcionales (codCompania, codSistema, codTipoCobertura, codSubtipoCobertura, estRegistro). codSubtipoCobertura se mapea a subtipoCobertura en BD. Si se define un filtro no debe estar vacío.

    **Seguridad:**
    - Sanitización automática de entrada habilitada
    - Validación de formato y estructura de datos

    **Filtros (todos opcionales):** codCompania, codSistema, codTipoCobertura, codSubtipoCobertura, estRegistro

    **Paginación keyset:** pagination.limit (1-1000, por defecto 1000), pagination.cursor (nextCursor/previousCursor de la respuesta anterior).`,
        operationId: 'queryBenefits',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de beneficios encontrados',
        type: BenefitSearchResponseDto,
        headers: {
            'X-Correlation-Id': {
                description: 'Identificador de la transacción',
                schema: { type: 'string' },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Solicitud inválida' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    @ApiSecurity('api_key')
    @ApiCommonHeaders('ConsultaBeneficios')
    async queryBenefits(
        @Body() request: BenefitSearchRequestDto,
        @RequestHeader(HeadersDto) headers: HeadersDto
    ): Promise<BenefitSearchResponseDto> {
        this.logger.info('Solicitud de consulta de beneficios recibida', {
            correlationId: headers[HttpHeaders.X_CORRELATION_ID],
        });
        const response = await this.queryBenefitsUseCase.execute(request);
        this.logger.info('Consulta de beneficios completada', {
            correlationId: headers[HttpHeaders.X_CORRELATION_ID],
            itemCount: response.data.length,
        });
        return response;
    }
}
