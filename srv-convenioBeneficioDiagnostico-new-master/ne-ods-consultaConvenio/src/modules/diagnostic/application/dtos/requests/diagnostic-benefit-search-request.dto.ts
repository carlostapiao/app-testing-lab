import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { ValidateAtLeastOneDiagnosticBenefitFilter } from './at-least-one-diagnostic-benefit-filter.validator';
import { DiagnosticBenefitFiltersDto } from './diagnostic-benefit-filters.dto';

export const DIAGNOSTIC_BENEFIT_MAX_LIMIT = 1000;
const DEFAULT_LIMIT = 1000;

/** Paginación keyset para diagnósticos-beneficios. */
export class DiagnosticBenefitPaginationDto {
    @ApiPropertyOptional({
        description: 'Registros por página (máximo 1000)',
        minimum: 1,
        maximum: DIAGNOSTIC_BENEFIT_MAX_LIMIT,
        default: DEFAULT_LIMIT,
        example: 1000,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(DIAGNOSTIC_BENEFIT_MAX_LIMIT)
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
 * Body para POST /diagnosticos/beneficios.
 * Al menos un filtro requerido. Paginación keyset.
 */
export class DiagnosticBenefitSearchRequestDto {
    @ApiProperty({
        description:
            'Filtros. Al menos uno requerido: codSistemaDiagnosticoBeneficio, codDiagnostico (array), codBeneficio, estDiagnosticoBeneficio.',
        type: DiagnosticBenefitFiltersDto,
    })
    @IsDefined()
    @ValidateNested()
    @Type(() => DiagnosticBenefitFiltersDto)
    @ValidateAtLeastOneDiagnosticBenefitFilter()
    readonly filters: DiagnosticBenefitFiltersDto;

    @ApiPropertyOptional({
        description: 'Paginación keyset (limit y cursor)',
        type: DiagnosticBenefitPaginationDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => DiagnosticBenefitPaginationDto)
    readonly pagination?: DiagnosticBenefitPaginationDto;
}
