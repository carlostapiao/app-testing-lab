import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { ValidateAtLeastOneBenefitFilter } from './at-least-one-benefit-filter.validator';
import { BenefitFiltersDto } from './benefit-filters.dto';

export const BENEFIT_MAX_LIMIT = 1000;
const DEFAULT_LIMIT = 1000;

/** Paginación keyset para beneficios (limit 1-1000, cursor opcional). */
export class BenefitPaginationDto {
    @ApiPropertyOptional({
        description: 'Registros por página (máximo 1000)',
        minimum: 1,
        maximum: BENEFIT_MAX_LIMIT,
        default: DEFAULT_LIMIT,
        example: 1000,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(BENEFIT_MAX_LIMIT)
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
 * Body para consulta de beneficios (POST /beneficios).
 * Debe proporcionar al menos un filtro (distinto de la paginación). Paginación keyset.
 */
export class BenefitSearchRequestDto {
    @ApiProperty({
        description:
            'Filtros. Debe proporcionar al menos uno (codCompania, codSistema, codTipoCobertura, codSubtipoCobertura o estRegistro). codSubtipoCobertura mapea a subtipoCobertura en BD.',
        type: BenefitFiltersDto,
        example: {
            codCompania: '20002',
            codSistema: 'NS',
            codTipoCobertura: '4',
            codSubtipoCobertura: '100',
            estRegistro: 'V',
        },
    })
    @IsDefined()
    @ValidateNested()
    @Type(() => BenefitFiltersDto)
    @ValidateAtLeastOneBenefitFilter()
    readonly filters: BenefitFiltersDto;

    @ApiPropertyOptional({
        description: 'Paginación keyset (limit y cursor)',
        type: BenefitPaginationDto,
        example: { limit: 1000, cursor: 'eyJ...' },
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => BenefitPaginationDto)
    readonly pagination?: BenefitPaginationDto;
}
