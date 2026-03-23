import { Injectable } from '@nestjs/common';
import type { DiagnosticEntity } from '../../domain/entities/diagnostic.entity';
import type { DiagnosticSummaryDto } from '../dtos/responses/diagnostic-summary.dto';

@Injectable()
export class DiagnosticMapper {
    toSummaryDto(diagnostic: DiagnosticEntity): DiagnosticSummaryDto {
        return {
            codDiagnostico: diagnostic.codDiagnostico ?? null,
            desDiagnostico: diagnostic.desDiagnostico ?? null,
            estRegistro: diagnostic.estRegistro ?? null,
            codSistema: diagnostic.codSistema ?? null,
        };
    }
}
