import { BenefitEntity } from '@/modules/benefit/domain/entities/benefit.entity';

describe('BenefitEntity', () => {
    it('debe crear entidad con create() y mapear todos los campos', () => {
        const params = {
            codCompania: '20002',
            codSistema: 'NS',
            codCobertura: '4',
            codSubTipoCobertura: '100',
            codBeneficio: 'B001',
            desBeneficio: 'Beneficio test',
            estRegistro: 'V',
        };
        const entity = BenefitEntity.create(params);
        expect(entity.codCompania).toBe('20002');
        expect(entity.codSistema).toBe('NS');
        expect(entity.codCobertura).toBe('4');
        expect(entity.codSubTipoCobertura).toBe('100');
        expect(entity.codBeneficio).toBe('B001');
        expect(entity.desBeneficio).toBe('Beneficio test');
        expect(entity.estRegistro).toBe('V');
    });

    it('debe normalizar undefined a null en todos los campos', () => {
        const entity = BenefitEntity.create({
            codCompania: undefined as unknown as string,
            codSistema: undefined as unknown as string,
            codCobertura: undefined as unknown as string,
            codSubTipoCobertura: undefined as unknown as string,
            codBeneficio: undefined as unknown as string,
            desBeneficio: undefined as unknown as string,
            estRegistro: undefined as unknown as string,
        });
        expect(entity.codCompania).toBeNull();
        expect(entity.codSistema).toBeNull();
        expect(entity.codCobertura).toBeNull();
        expect(entity.codSubTipoCobertura).toBeNull();
        expect(entity.codBeneficio).toBeNull();
        expect(entity.desBeneficio).toBeNull();
        expect(entity.estRegistro).toBeNull();
    });

    it('debe aceptar null explícito en params', () => {
        const entity = BenefitEntity.create({
            codCompania: null,
            codSistema: null,
            codCobertura: null,
            codSubTipoCobertura: null,
            codBeneficio: null,
            desBeneficio: null,
            estRegistro: null,
        });
        expect(entity.codCompania).toBeNull();
        expect(entity.codBeneficio).toBeNull();
    });
});
