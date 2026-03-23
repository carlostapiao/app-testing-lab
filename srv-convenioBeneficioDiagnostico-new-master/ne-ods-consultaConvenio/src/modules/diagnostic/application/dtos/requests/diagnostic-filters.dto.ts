import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

const MAX_COD_DIAGNOSTICO_ARRAY = 1000;

/**
 * Filtros de consulta de diagnósticos.
 * codDiagnostico: si se define debe no estar vacío (array máximo 1000 elementos).
 * estRegistro y codSistema: opcionales; si se definen no deben estar vacíos.
 */
export class DiagnosticFiltersDto {
    @ApiProperty({
        description: 'Códigos de diagnóstico (codDiagnostico). Obligatorio, no vacío (máximo 1000 elementos)',
        example: ['A001', 'B002'],
        type: [String],
        maxItems: MAX_COD_DIAGNOSTICO_ARRAY,
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(MAX_COD_DIAGNOSTICO_ARRAY, {
        message: `codDiagnostico no puede tener más de ${MAX_COD_DIAGNOSTICO_ARRAY} elementos`,
    })
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    readonly codDiagnostico?: string[];

    @ApiPropertyOptional({
        description: 'Estado de registro (estRegistro)',
        example: 'V',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(5)
    readonly estRegistro?: string;

    @ApiPropertyOptional({
        description: 'Código de sistema (codSistema)',
        example: 'NS',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(5)
    readonly codSistema?: string;
}
