import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { ValidateAtLeastOneDiagnosticFilter } from './at-least-one-diagnostic-filter.validator';
import { DiagnosticFiltersDto } from './diagnostic-filters.dto';

export const DIAGNOSTIC_MAX_LIMIT = 1000;
const DEFAULT_LIMIT = 1000;

/** Paginación keyset para diagnósticos (limit 1-1000, cursor opcional). */
export class DiagnosticPaginationDto {
    @ApiPropertyOptional({
        description: 'Registros por página (máximo 1000)',
        minimum: 1,
        maximum: DIAGNOSTIC_MAX_LIMIT,
        default: DEFAULT_LIMIT,
        example: 1000,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(DIAGNOSTIC_MAX_LIMIT)
    readonly limit?: number;

    @ApiPropertyOptional({
        description: 'Cursor keyset (nextCursor o previousCursor de la respuesta anterior)',
        type: String,
    })
    @IsOptional()
    @IsString()
    readonly cursor?: string;
}

/**
 * Body para consulta de diagnósticos (POST /diagnosticos).
 * Filtros: codDiagnostico obligatorio (array no vacío, max 1000), estRegistro y codSistema opcionales.
 * Paginación keyset.
 */
export class DiagnosticSearchRequestDto {
    @ApiProperty({
        description:
            'Filtros. codDiagnostico obligatorio (array no vacío, max 1000). estRegistro y codSistema opcionales.',
        type: DiagnosticFiltersDto,
        example: {
            codDiagnostico: ['A001', 'B002'],
            estRegistro: 'V',
            codSistema: 'NS',
        },
    })
    @ValidateNested()
    @Type(() => DiagnosticFiltersDto)
    @ValidateAtLeastOneDiagnosticFilter()
    readonly filters: DiagnosticFiltersDto;

    @ApiPropertyOptional({
        description: 'Paginación keyset (limit y cursor)',
        type: DiagnosticPaginationDto,
        example: { limit: 1000, cursor: 'eyJ...' },
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => DiagnosticPaginationDto)
    readonly pagination?: DiagnosticPaginationDto;
}
