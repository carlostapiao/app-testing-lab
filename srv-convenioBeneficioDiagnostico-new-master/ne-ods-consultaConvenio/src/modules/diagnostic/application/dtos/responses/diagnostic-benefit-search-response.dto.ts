import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiagnosticBenefitSummaryDto } from './diagnostic-benefit-summary.dto';

/** Metadata de paginación keyset. */
export class MetaDiagnosticBenefitSummaryDto {
    @ApiProperty({ description: 'Elementos en esta página', example: 10, type: Number })
    itemCount: number;

    @ApiProperty({ description: 'Tamaño de página solicitado', example: 1000, type: Number })
    pageSize: number;

    @ApiProperty({ description: 'Hay más páginas siguientes', example: true, type: Boolean })
    hasNextPage: boolean;

    @ApiProperty({ description: 'Hay páginas anteriores', example: false, type: Boolean })
    hasPreviousPage: boolean;
}

/** Cursores keyset. */
export class CursorsDiagnosticBenefitSummaryDto {
    @ApiPropertyOptional({ description: 'Cursor siguiente', nullable: true, type: String })
    nextCursor: string | null;

    @ApiPropertyOptional({ description: 'Cursor anterior', nullable: true, type: String })
    previousCursor: string | null;
}

/**
 * Respuesta de consulta diagnósticos-beneficios (POST /diagnosticos/beneficios) con paginación keyset.
 */
export class DiagnosticBenefitSearchResponseDto {
    @ApiProperty({
        description: 'Lista de relaciones diagnóstico-beneficio con datos de diagnóstico y beneficio',
        type: [DiagnosticBenefitSummaryDto],
    })
    readonly data: DiagnosticBenefitSummaryDto[];

    @ApiProperty({
        description: 'Metadata de paginación',
        type: MetaDiagnosticBenefitSummaryDto,
    })
    readonly meta: MetaDiagnosticBenefitSummaryDto;

    @ApiProperty({
        description: 'Cursores para navegación',
        type: CursorsDiagnosticBenefitSummaryDto,
    })
    readonly cursors: CursorsDiagnosticBenefitSummaryDto;
}
