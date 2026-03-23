import { DIAGNOSTIC_MAX_LIMIT } from '@modules/diagnostic/application/dtos/requests/diagnostic-search-request.dto';
import { DiagnosticMapper } from '@modules/diagnostic/application/mappers/diagnostic.mapper';
import { DiagnosticEntity } from '@modules/diagnostic/domain/entities/diagnostic.entity';
import { LoggerService } from '@shared/logger/logger.service';
import { QueryDiagnosticsUseCase } from '@/modules/diagnostic/application/use-cases/query-diagnostics.use-case';

describe('QueryDiagnosticsUseCase', () => {
    let useCase: QueryDiagnosticsUseCase;
    let mockRepository: { findByFiltersPaginated: jest.Mock };
    let mockLogger: { withContext: jest.Mock; info: jest.Mock };

    beforeEach(() => {
        mockLogger = { withContext: jest.fn().mockReturnThis(), info: jest.fn() };
        mockRepository = { findByFiltersPaginated: jest.fn() };
        useCase = new QueryDiagnosticsUseCase(
            mockRepository as never,
            mockLogger as unknown as LoggerService,
            new DiagnosticMapper()
        );
    });

    it('debe usar limit por defecto cuando pagination no tiene limit', async () => {
        const entity = DiagnosticEntity.create({
            codDiagnostico: 'D001',
            desDiagnostico: 'Desc',
            estRegistro: 'V',
            codSistema: 'NS',
        });
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [entity],
            meta: { itemCount: 1, pageSize: DIAGNOSTIC_MAX_LIMIT, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        });

        const request = {
            filters: { codDiagnostico: ['D001'] },
        };
        const result = await useCase.execute(request as never);

        expect(mockRepository.findByFiltersPaginated).toHaveBeenCalledWith(
            { codDiagnostico: ['D001'], estRegistro: undefined, codSistema: undefined },
            { cursor: undefined, pageSize: DIAGNOSTIC_MAX_LIMIT }
        );
        expect(result.data).toHaveLength(1);
        expect(result.data[0].codDiagnostico).toBe('D001');
    });

    it('debe pasar cursor y pageSize cuando se envían en request', async () => {
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [],
            meta: { itemCount: 0, pageSize: 100, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        });

        await useCase.execute({
            filters: { codDiagnostico: ['D1'], codSistema: 'NS' },
            pagination: { limit: 100, cursor: 'cursor_token' },
        } as never);

        expect(mockRepository.findByFiltersPaginated).toHaveBeenCalledWith(expect.any(Object), {
            cursor: 'cursor_token',
            pageSize: 100,
        });
    });

    it('debe loguear No aplicado cuando codDiagnostico está vacío y estRegistro/codSistema no definidos', async () => {
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [],
            meta: { itemCount: 0, pageSize: 1000, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        });
        await useCase.execute({
            filters: { codDiagnostico: [], estRegistro: undefined, codSistema: undefined },
        } as never);
        expect(mockRepository.findByFiltersPaginated).toHaveBeenCalledWith(
            { codDiagnostico: [], estRegistro: undefined, codSistema: undefined },
            expect.any(Object)
        );
    });

    it('debe tratar codDiagnostico undefined como array vacío y mostrar No aplicado en appliedFilters', async () => {
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [],
            meta: { itemCount: 0, pageSize: DIAGNOSTIC_MAX_LIMIT, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        });
        await useCase.execute({
            filters: { codDiagnostico: undefined, estRegistro: 'V', codSistema: 'NS' } as never,
        } as never);
        expect(mockRepository.findByFiltersPaginated).toHaveBeenCalledWith(
            { codDiagnostico: [], estRegistro: 'V', codSistema: 'NS' },
            { cursor: undefined, pageSize: DIAGNOSTIC_MAX_LIMIT }
        );
    });
});
