import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de un ítem de beneficio en la respuesta.
 */
export class BenefitSummaryDto {
    @ApiPropertyOptional({ description: 'Código compañía', example: '20002', nullable: true })
    readonly codCompania: string | null;

    @ApiPropertyOptional({ description: 'Código sistema', example: 'NS', nullable: true })
    readonly codSistema: string | null;

    @ApiPropertyOptional({ description: 'Código tipo cobertura', example: '4', nullable: true })
    readonly codTipoCobertura: string | null;

    @ApiPropertyOptional({ description: 'Código subtipo cobertura', example: '100', nullable: true })
    readonly codSubTipoCobertura: string | null;

    @ApiPropertyOptional({ description: 'Código beneficio', nullable: true })
    readonly codBeneficio: string | null;

    @ApiPropertyOptional({ description: 'Descripción beneficio', nullable: true })
    readonly desBeneficio: string | null;

    @ApiPropertyOptional({ description: 'Estado registro', example: 'V', nullable: true })
    readonly estRegistro: string | null;
}
