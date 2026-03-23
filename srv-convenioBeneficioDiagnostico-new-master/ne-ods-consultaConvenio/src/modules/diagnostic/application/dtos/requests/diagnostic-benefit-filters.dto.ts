import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

const MAX_COD_DIAGNOSTICO_ARRAY = 1000;

/**
 * Filtros para consulta diagnósticos-beneficios (Mae_DiagnosticoBeneficio + Mae_Beneficio + Mae_Diagnostico).
 */
export class DiagnosticBenefitFiltersDto {
    @ApiPropertyOptional({
        description: 'Código sistema de la relación diagnóstico-beneficio (codSistema en Mae_DiagnosticoBeneficio)',
        example: 'NS',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(5)
    readonly codSistemaDiagnosticoBeneficio?: string;

    @ApiPropertyOptional({
        description: 'Códigos de diagnóstico. Si se define no vacío (máx. 1000)',
        example: ['A00', 'B01'],
        type: [String],
        maxItems: MAX_COD_DIAGNOSTICO_ARRAY,
    })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(MAX_COD_DIAGNOSTICO_ARRAY)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    readonly codDiagnostico?: string[];

    @ApiPropertyOptional({
        description: 'Código beneficio',
        example: '001',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(5)
    readonly codBeneficio?: string;

    @ApiPropertyOptional({
        description: 'Estado registro de la relación diagnóstico-beneficio (estDiagnosticoBeneficio)',
        example: 'V',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(5)
    readonly estDiagnosticoBeneficio?: string;
}
