import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Filtros de consulta de beneficios.
 * Todos opcionales; si se definen no deben estar vacíos.
 */
export class BenefitFiltersDto {
    @ApiPropertyOptional({
        description: 'Código de compañía (codCompania)',
        example: '20002',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(5)
    readonly codCompania?: string;

    @ApiPropertyOptional({
        description: 'Código de sistema (codSistema)',
        example: 'NS',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(5)
    readonly codSistema?: string;

    @ApiPropertyOptional({
        description: 'Código tipo de cobertura (codTipoCobertura)',
        example: '4',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    readonly codTipoCobertura?: string;

    @ApiPropertyOptional({
        description: 'Código subtipo de cobertura (codSubtipoCobertura)',
        example: '100',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(4)
    readonly codSubtipoCobertura?: string;

    @ApiPropertyOptional({
        description: 'Estado de registro (estRegistro)',
        example: 'V',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(5)
    readonly estRegistro?: string;
}
