import { DiagnosticBenefitEntity } from '@/modules/diagnostic/domain/entities/diagnostic-benefit.entity';

describe('DiagnosticBenefitEntity', () => {
    it('debe crear entidad con create() y mapear todos los campos', () => {
        const params = {
            codSistemaDiagnosticoBeneficio: 'SDB',
            estDiagnosticoBeneficio: 'V',
            codSistemaDiagnostico: 'NS',
            codDiagnostico: 'D001',
            desDiagnostico: 'Diag',
            estDiagnostico: 'V',
            codSistemaBeneficio: 'NS',
            codBeneficio: 'B001',
            desBeneficio: 'Ben',
            estBeneficio: 'V',
        };
        const entity = DiagnosticBenefitEntity.create(params);
        expect(entity.codSistemaDiagnosticoBeneficio).toBe('SDB');
        expect(entity.codDiagnostico).toBe('D001');
        expect(entity.codBeneficio).toBe('B001');
        expect(entity.desBeneficio).toBe('Ben');
    });

    it('debe normalizar undefined a null', () => {
        const entity = DiagnosticBenefitEntity.create({
            codSistemaDiagnosticoBeneficio: undefined as unknown as string,
            estDiagnosticoBeneficio: undefined as unknown as string,
            codSistemaDiagnostico: undefined as unknown as string,
            codDiagnostico: undefined as unknown as string,
            desDiagnostico: undefined as unknown as string,
            estDiagnostico: undefined as unknown as string,
            codSistemaBeneficio: undefined as unknown as string,
            codBeneficio: undefined as unknown as string,
            desBeneficio: undefined as unknown as string,
            estBeneficio: undefined as unknown as string,
        });
        expect(entity.codDiagnostico).toBeNull();
        expect(entity.codBeneficio).toBeNull();
    });
});
