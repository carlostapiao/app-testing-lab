import { Injectable } from '@nestjs/common';
import type { BenefitEntity } from '../../domain/entities/benefit.entity';
import type { BenefitSummaryDto } from '../dtos/responses/benefit-summary.dto';

@Injectable()
export class BenefitMapper {
    toSummaryDto(benefit: BenefitEntity): BenefitSummaryDto {
        return {
            codCompania: benefit.codCompania ?? null,
            codSistema: benefit.codSistema ?? null,
            codTipoCobertura: benefit.codCobertura ?? null,
            codSubTipoCobertura: benefit.codSubTipoCobertura ?? null,
            codBeneficio: benefit.codBeneficio ?? null,
            desBeneficio: benefit.desBeneficio ?? null,
            estRegistro: benefit.estRegistro ?? null,
        };
    }
}
