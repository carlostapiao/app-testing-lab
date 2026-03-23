import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de un ítem de diagnóstico en la respuesta.
 */
export class DiagnosticSummaryDto {
    @ApiPropertyOptional({ description: 'Código diagnóstico', example: 'A001', nullable: true })
    readonly codDiagnostico: string | null;

    @ApiPropertyOptional({ description: 'Descripción diagnóstico', nullable: true })
    readonly desDiagnostico: string | null;

    @ApiPropertyOptional({ description: 'Estado registro', example: 'V', nullable: true })
    readonly estRegistro: string | null;

    @ApiPropertyOptional({ description: 'Código sistema', example: 'NS', nullable: true })
    readonly codSistema: string | null;
}
