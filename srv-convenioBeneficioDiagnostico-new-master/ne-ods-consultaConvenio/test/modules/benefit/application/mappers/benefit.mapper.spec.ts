import { BenefitEntity } from '@modules/benefit/domain/entities/benefit.entity';
import { BenefitMapper } from '@/modules/benefit/application/mappers/benefit.mapper';

describe('BenefitMapper', () => {
    let mapper: BenefitMapper;

    beforeEach(() => {
        mapper = new BenefitMapper();
    });

    it('debe mapear entidad a BenefitSummaryDto correctamente', () => {
        const entity = BenefitEntity.create({
            codCompania: '20002',
            codSistema: 'NS',
            codCobertura: '4',
            codSubTipoCobertura: '100',
            codBeneficio: 'B001',
            desBeneficio: 'Descripción',
            estRegistro: 'V',
        });
        const dto = mapper.toSummaryDto(entity);
        expect(dto).toEqual({
            codCompania: '20002',
            codSistema: 'NS',
            codTipoCobertura: '4',
            codSubTipoCobertura: '100',
            codBeneficio: 'B001',
            desBeneficio: 'Descripción',
            estRegistro: 'V',
        });
    });

    it('debe mapear valores null cuando la entidad tiene null', () => {
        const entity = BenefitEntity.create({
            codCompania: null,
            codSistema: null,
            codCobertura: null,
            codSubTipoCobertura: null,
            codBeneficio: null,
            desBeneficio: null,
            estRegistro: null,
        });
        const dto = mapper.toSummaryDto(entity);
        expect(dto.codCompania).toBeNull();
        expect(dto.codBeneficio).toBeNull();
        expect(dto.desBeneficio).toBeNull();
    });

    it('debe mapear codCobertura a codTipoCobertura en el DTO', () => {
        const entity = BenefitEntity.create({
            codCompania: null,
            codSistema: null,
            codCobertura: 'T1',
            codSubTipoCobertura: null,
            codBeneficio: 'B1',
            desBeneficio: null,
            estRegistro: null,
        });
        const dto = mapper.toSummaryDto(entity);
        expect(dto.codTipoCobertura).toBe('T1');
    });
});
