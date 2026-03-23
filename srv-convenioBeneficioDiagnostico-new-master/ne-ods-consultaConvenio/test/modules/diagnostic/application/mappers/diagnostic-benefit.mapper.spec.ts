import { DiagnosticBenefitEntity } from '@modules/diagnostic/domain/entities/diagnostic-benefit.entity';
import { DiagnosticBenefitMapper } from '@/modules/diagnostic/application/mappers/diagnostic-benefit.mapper';

describe('DiagnosticBenefitMapper', () => {
    let mapper: DiagnosticBenefitMapper;

    beforeEach(() => {
        mapper = new DiagnosticBenefitMapper();
    });

    it('debe mapear entidad a DiagnosticBenefitSummaryDto correctamente', () => {
        const entity = DiagnosticBenefitEntity.create({
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
        });
        const dto = mapper.toSummaryDto(entity);
        expect(dto.codSistemaDiagnosticoBeneficio).toBe('SDB');
        expect(dto.codDiagnostico).toBe('D001');
        expect(dto.codBeneficio).toBe('B001');
        expect(dto.desBeneficio).toBe('Ben');
    });

    it('debe mapear null cuando la entidad tiene null', () => {
        const entity = DiagnosticBenefitEntity.create({
            codSistemaDiagnosticoBeneficio: null,
            estDiagnosticoBeneficio: null,
            codSistemaDiagnostico: null,
            codDiagnostico: null,
            desDiagnostico: null,
            estDiagnostico: null,
            codSistemaBeneficio: null,
            codBeneficio: null,
            desBeneficio: null,
            estBeneficio: null,
        });
        const dto = mapper.toSummaryDto(entity);
        expect(dto.codDiagnostico).toBeNull();
        expect(dto.codBeneficio).toBeNull();
    });
});
