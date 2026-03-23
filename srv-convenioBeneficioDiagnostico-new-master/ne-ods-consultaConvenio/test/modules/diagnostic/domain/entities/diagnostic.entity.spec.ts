import { DiagnosticEntity } from '@/modules/diagnostic/domain/entities/diagnostic.entity';

describe('DiagnosticEntity', () => {
    it('debe crear entidad con create() y mapear todos los campos', () => {
        const params = {
            codDiagnostico: 'D001',
            desDiagnostico: 'Descripción diagnóstico',
            estRegistro: 'V',
            codSistema: 'NS',
        };
        const entity = DiagnosticEntity.create(params);
        expect(entity.codDiagnostico).toBe('D001');
        expect(entity.desDiagnostico).toBe('Descripción diagnóstico');
        expect(entity.estRegistro).toBe('V');
        expect(entity.codSistema).toBe('NS');
    });

    it('debe normalizar undefined a null', () => {
        const entity = DiagnosticEntity.create({
            codDiagnostico: undefined as unknown as string,
            desDiagnostico: undefined as unknown as string,
            estRegistro: undefined as unknown as string,
            codSistema: undefined as unknown as string,
        });
        expect(entity.codDiagnostico).toBeNull();
        expect(entity.desDiagnostico).toBeNull();
        expect(entity.estRegistro).toBeNull();
        expect(entity.codSistema).toBeNull();
    });
});
