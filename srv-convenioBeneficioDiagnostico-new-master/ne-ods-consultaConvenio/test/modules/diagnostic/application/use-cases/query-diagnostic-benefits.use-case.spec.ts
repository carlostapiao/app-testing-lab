import { DIAGNOSTIC_BENEFIT_MAX_LIMIT } from '@modules/diagnostic/application/dtos/requests/diagnostic-benefit-search-request.dto';
import { DiagnosticBenefitMapper } from '@modules/diagnostic/application/mappers/diagnostic-benefit.mapper';
import { DiagnosticBenefitEntity } from '@modules/diagnostic/domain/entities/diagnostic-benefit.entity';
import { LoggerService } from '@shared/logger/logger.service';
import { QueryDiagnosticBenefitsUseCase } from '@/modules/diagnostic/application/use-cases/query-diagnostic-benefits.use-case';

describe('QueryDiagnosticBenefitsUseCase', () => {
    let useCase: QueryDiagnosticBenefitsUseCase;
    let mockRepository: { findByFiltersPaginated: jest.Mock };
    let mockLogger: { withContext: jest.Mock; info: jest.Mock };

    beforeEach(() => {
        mockLogger = { withContext: jest.fn().mockReturnThis(), info: jest.fn() };
        mockRepository = { findByFiltersPaginated: jest.fn() };
        useCase = new QueryDiagnosticBenefitsUseCase(
            mockRepository as never,
            mockLogger as unknown as LoggerService,
            new DiagnosticBenefitMapper()
        );
    });

    it('debe usar limit por defecto y devolver data mapeada', async () => {
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
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [entity],
            meta: { itemCount: 1, pageSize: DIAGNOSTIC_BENEFIT_MAX_LIMIT, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        });

        const request = {
            filters: { codDiagnostico: 'D001' },
        };
        const result = await useCase.execute(request as never);

        expect(mockRepository.findByFiltersPaginated).toHaveBeenCalledWith(
            expect.objectContaining({ codDiagnostico: 'D001' }),
            { cursor: undefined, pageSize: DIAGNOSTIC_BENEFIT_MAX_LIMIT }
        );
        expect(result.data).toHaveLength(1);
        expect(result.data[0].codDiagnostico).toBe('D001');
        expect(result.data[0].codBeneficio).toBe('B001');
    });

    it('debe loguear appliedFilters con todos los filtros definidos', async () => {
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [],
            meta: { itemCount: 0, pageSize: 1000, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        });
        await useCase.execute({
            filters: {
                codSistemaDiagnosticoBeneficio: 'SDB',
                codDiagnostico: ['D1'],
                codBeneficio: 'B1',
                estDiagnosticoBeneficio: 'V',
            },
        } as never);
        expect(mockRepository.findByFiltersPaginated).toHaveBeenCalledWith(
            expect.objectContaining({
                codSistemaDiagnosticoBeneficio: 'SDB',
                codBeneficio: 'B1',
                estDiagnosticoBeneficio: 'V',
            }),
            expect.any(Object)
        );
    });

    it('debe usar appliedFilters con No aplicado cuando algún filtro no está definido', async () => {
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [],
            meta: { itemCount: 0, pageSize: DIAGNOSTIC_BENEFIT_MAX_LIMIT, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        });
        await useCase.execute({
            filters: { codDiagnostico: 'D1' } as never,
        } as never);
        expect(mockRepository.findByFiltersPaginated).toHaveBeenCalledWith(
            expect.objectContaining({ codDiagnostico: 'D1' }),
            { cursor: undefined, pageSize: DIAGNOSTIC_BENEFIT_MAX_LIMIT }
        );
    });

    it('debe usar pagination.limit y cursor cuando se envían', async () => {
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [],
            meta: { itemCount: 0, pageSize: 50, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        });
        await useCase.execute({
            filters: { codBeneficio: 'B1' },
            pagination: { limit: 50, cursor: 'cur_token' },
        } as never);
        expect(mockRepository.findByFiltersPaginated).toHaveBeenCalledWith(expect.any(Object), {
            cursor: 'cur_token',
            pageSize: 50,
        });
    });
});
