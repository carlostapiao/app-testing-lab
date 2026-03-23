import { DiagnosticEntity } from '@modules/diagnostic/domain/entities/diagnostic.entity';
import { DiagnosticMapper } from '@/modules/diagnostic/application/mappers/diagnostic.mapper';

describe('DiagnosticMapper', () => {
    let mapper: DiagnosticMapper;

    beforeEach(() => {
        mapper = new DiagnosticMapper();
    });

    it('debe mapear entidad a DiagnosticSummaryDto correctamente', () => {
        const entity = DiagnosticEntity.create({
            codDiagnostico: 'D001',
            desDiagnostico: 'Descripción',
            estRegistro: 'V',
            codSistema: 'NS',
        });
        const dto = mapper.toSummaryDto(entity);
        expect(dto).toEqual({
            codDiagnostico: 'D001',
            desDiagnostico: 'Descripción',
            estRegistro: 'V',
            codSistema: 'NS',
        });
    });

    it('debe mapear null cuando la entidad tiene null', () => {
        const entity = DiagnosticEntity.create({
            codDiagnostico: null,
            desDiagnostico: null,
            estRegistro: null,
            codSistema: null,
        });
        const dto = mapper.toSummaryDto(entity);
        expect(dto.codDiagnostico).toBeNull();
        expect(dto.desDiagnostico).toBeNull();
    });
});
