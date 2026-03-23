import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiagnosticSummaryDto } from './diagnostic-summary.dto';

/** Metadata de paginación keyset. */
export class MetaDiagnosticSummaryDto {
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
export class CursorsDiagnosticSummaryDto {
    @ApiPropertyOptional({ description: 'Cursor siguiente', nullable: true, type: String })
    nextCursor: string | null;

    @ApiPropertyOptional({ description: 'Cursor anterior', nullable: true, type: String })
    previousCursor: string | null;
}

/**
 * Respuesta de consulta de diagnósticos (POST /diagnosticos) con paginación keyset.
 */
export class DiagnosticSearchResponseDto {
    @ApiProperty({
        description: 'Lista de diagnósticos',
        type: [DiagnosticSummaryDto],
    })
    readonly data: DiagnosticSummaryDto[];

    @ApiProperty({
        description: 'Metadata de paginación',
        type: MetaDiagnosticSummaryDto,
    })
    readonly meta: MetaDiagnosticSummaryDto;

    @ApiProperty({
        description: 'Cursores para navegación',
        type: CursorsDiagnosticSummaryDto,
    })
    readonly cursors: CursorsDiagnosticSummaryDto;
}
