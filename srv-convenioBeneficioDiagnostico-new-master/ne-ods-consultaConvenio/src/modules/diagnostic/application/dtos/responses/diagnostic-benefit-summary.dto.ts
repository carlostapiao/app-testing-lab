import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de un ítem diagnóstico-beneficio según spec: relación + datos diagnóstico + datos beneficio.
 */
export class DiagnosticBenefitSummaryDto {
    @ApiPropertyOptional({ description: 'Código sistema relación diagnóstico-beneficio', nullable: true })
    readonly codSistemaDiagnosticoBeneficio: string | null;

    @ApiPropertyOptional({ description: 'Estado registro relación diagnóstico-beneficio', nullable: true })
    readonly estDiagnosticoBeneficio: string | null;

    @ApiPropertyOptional({ description: 'Código sistema del diagnóstico', nullable: true })
    readonly codSistemaDiagnostico: string | null;

    @ApiPropertyOptional({ description: 'Código diagnóstico', nullable: true })
    readonly codDiagnostico: string | null;

    @ApiPropertyOptional({ description: 'Descripción diagnóstico', nullable: true })
    readonly desDiagnostico: string | null;

    @ApiPropertyOptional({ description: 'Estado diagnóstico', nullable: true })
    readonly estDiagnostico: string | null;

    @ApiPropertyOptional({ description: 'Código sistema del beneficio', nullable: true })
    readonly codSistemaBeneficio: string | null;

    @ApiPropertyOptional({ description: 'Código beneficio', nullable: true })
    readonly codBeneficio: string | null;

    @ApiPropertyOptional({ description: 'Descripción beneficio', nullable: true })
    readonly desBeneficio: string | null;

    @ApiPropertyOptional({ description: 'Estado beneficio', nullable: true })
    readonly estBeneficio: string | null;
}
