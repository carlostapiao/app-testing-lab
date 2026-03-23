import { Injectable } from '@nestjs/common';
import type { DiagnosticBenefitEntity } from '../../domain/entities/diagnostic-benefit.entity';
import type { DiagnosticBenefitSummaryDto } from '../dtos/responses/diagnostic-benefit-summary.dto';

@Injectable()
export class DiagnosticBenefitMapper {
    toSummaryDto(entity: DiagnosticBenefitEntity): DiagnosticBenefitSummaryDto {
        return {
            codSistemaDiagnosticoBeneficio: entity.codSistemaDiagnosticoBeneficio ?? null,
            estDiagnosticoBeneficio: entity.estDiagnosticoBeneficio ?? null,
            codSistemaDiagnostico: entity.codSistemaDiagnostico ?? null,
            codDiagnostico: entity.codDiagnostico ?? null,
            desDiagnostico: entity.desDiagnostico ?? null,
            estDiagnostico: entity.estDiagnostico ?? null,
            codSistemaBeneficio: entity.codSistemaBeneficio ?? null,
            codBeneficio: entity.codBeneficio ?? null,
            desBeneficio: entity.desBeneficio ?? null,
            estBeneficio: entity.estBeneficio ?? null,
        };
    }
}
