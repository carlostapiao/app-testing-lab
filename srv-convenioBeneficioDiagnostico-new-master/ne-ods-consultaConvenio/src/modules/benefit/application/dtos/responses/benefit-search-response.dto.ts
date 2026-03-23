import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BenefitSummaryDto } from './benefit-summary.dto';

/** Metadata de paginación keyset. */
export class MetaBenefitSummaryDto {
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
export class CursorsBenefitSummaryDto {
    @ApiPropertyOptional({ description: 'Cursor siguiente', nullable: true, type: String })
    nextCursor: string | null;

    @ApiPropertyOptional({ description: 'Cursor anterior', nullable: true, type: String })
    previousCursor: string | null;
}

/**
 * Respuesta de consulta de beneficios (POST /beneficios) con paginación keyset.
 */
export class BenefitSearchResponseDto {
    @ApiProperty({
        description: 'Lista de beneficios',
        type: [BenefitSummaryDto],
    })
    readonly data: BenefitSummaryDto[];

    @ApiProperty({
        description: 'Metadata de paginación',
        type: MetaBenefitSummaryDto,
    })
    readonly meta: MetaBenefitSummaryDto;

    @ApiProperty({
        description: 'Cursores para navegación',
        type: CursorsBenefitSummaryDto,
    })
    readonly cursors: CursorsBenefitSummaryDto;
}
