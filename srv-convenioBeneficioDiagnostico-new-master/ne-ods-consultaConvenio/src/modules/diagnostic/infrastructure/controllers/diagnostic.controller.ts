import { DiagnosticBenefitSearchRequestDto } from '@modules/diagnostic/application/dtos/requests/diagnostic-benefit-search-request.dto';
import { DiagnosticSearchRequestDto } from '@modules/diagnostic/application/dtos/requests/diagnostic-search-request.dto';
import { DiagnosticBenefitSearchResponseDto } from '@modules/diagnostic/application/dtos/responses/diagnostic-benefit-search-response.dto';
import { DiagnosticSearchResponseDto } from '@modules/diagnostic/application/dtos/responses/diagnostic-search-response.dto';
import { QueryDiagnosticBenefitsUseCase } from '@modules/diagnostic/application/use-cases/query-diagnostic-benefits.use-case';
import { QueryDiagnosticsUseCase } from '@modules/diagnostic/application/use-cases/query-diagnostics.use-case';
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
 * Controlador REST para consulta de diagnósticos (convenio.Mae_Diagnostico).
 *
 * @security Protegido contra HTTP Request Smuggling
 * @security Sanitización global de entrada activa
 */
@Controller({ path: 'diagnosticos', version: '1.0.0' })
@ApiTags('Convenios de Beneficio - Diagnósticos')
@UseInterceptors(DuplicatePropertiesInterceptor)
@UseGuards(RequestSmugglingGuard)
export class DiagnosticController {
    private readonly logger = this.loggerService.withContext(DiagnosticController.name);

    constructor(
        private readonly loggerService: LoggerService,
        private readonly queryDiagnosticsUseCase: QueryDiagnosticsUseCase,
        private readonly queryDiagnosticBenefitsUseCase: QueryDiagnosticBenefitsUseCase
    ) {}

    /**
     * Consulta de diagnósticos
     * POST /diagnosticos
     */
    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Consulta de diagnósticos',
        description: `Listado de diagnósticos con paginación keyset. codDiagnostico obligatorio (array no vacío, máx. 1000 elementos). estRegistro y codSistema opcionales; si se definen no deben estar vacíos.

    **Seguridad:**
    - Sanitización automática de entrada habilitada
    - Validación de formato y estructura de datos

    **Filtros:** codDiagnostico (obligatorio), estRegistro, codSistema (opcionales)

    **Paginación keyset:** pagination.limit (1-1000, por defecto 1000), pagination.cursor (nextCursor/previousCursor de la respuesta anterior).`,
        operationId: 'queryDiagnostics',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de diagnósticos encontrados',
        type: DiagnosticSearchResponseDto,
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
    @ApiCommonHeaders('ConsultaDiagnosticos')
    async queryDiagnostics(
        @Body() request: DiagnosticSearchRequestDto,
        @RequestHeader(HeadersDto) headers: HeadersDto
    ): Promise<DiagnosticSearchResponseDto> {
        this.logger.info('Solicitud de consulta de diagnósticos recibida', {
            correlationId: headers[HttpHeaders.X_CORRELATION_ID],
        });
        const response = await this.queryDiagnosticsUseCase.execute(request);
        this.logger.info('Consulta de diagnósticos completada', {
            correlationId: headers[HttpHeaders.X_CORRELATION_ID],
            itemCount: response.data.length,
        });
        return response;
    }

    /**
     * Consulta diagnósticos-beneficios (relación Mae_DiagnosticoBeneficio + Mae_Beneficio + Mae_Diagnostico)
     * POST /diagnosticos/beneficios
     */
    @Post('beneficios')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Consulta diagnósticos-beneficios',
        description: `Listado de relaciones diagnóstico-beneficio con datos de diagnóstico y beneficio. LEFT JOIN a Mae_Beneficio (datos beneficio pueden ser NULL), INNER JOIN a Mae_Diagnostico. Al menos un filtro requerido. Paginación keyset.`,
        operationId: 'queryDiagnosticBenefits',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de diagnósticos-beneficios',
        type: DiagnosticBenefitSearchResponseDto,
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
    @ApiCommonHeaders('ConsultaDiagnosticosBeneficios')
    async queryDiagnosticBenefits(
        @Body() request: DiagnosticBenefitSearchRequestDto,
        @RequestHeader(HeadersDto) headers: HeadersDto
    ): Promise<DiagnosticBenefitSearchResponseDto> {
        this.logger.info('Solicitud de consulta diagnósticos-beneficios recibida', {
            correlationId: headers[HttpHeaders.X_CORRELATION_ID],
        });
        const response = await this.queryDiagnosticBenefitsUseCase.execute(request);
        this.logger.info('Consulta diagnósticos-beneficios completada', {
            correlationId: headers[HttpHeaders.X_CORRELATION_ID],
            itemCount: response.data.length,
        });
        return response;
    }
}
