import { BENEFIT_MAX_LIMIT } from '@modules/benefit/application/dtos/requests/benefit-search-request.dto';
import { BenefitMapper } from '@modules/benefit/application/mappers/benefit.mapper';
import { BenefitEntity } from '@modules/benefit/domain/entities/benefit.entity';
import { LoggerService } from '@shared/logger/logger.service';
import { QueryBenefitsUseCase } from '@/modules/benefit/application/use-cases/query-benefits.use-case';

describe('QueryBenefitsUseCase', () => {
    let useCase: QueryBenefitsUseCase;
    let mockRepository: {
        findByFiltersPaginated: jest.Mock;
    };
    let mockLogger: { withContext: jest.Mock; info: jest.Mock };

    beforeEach(() => {
        mockLogger = {
            withContext: jest.fn().mockReturnThis(),
            info: jest.fn(),
        };
        mockRepository = {
            findByFiltersPaginated: jest.fn(),
        };
        useCase = new QueryBenefitsUseCase(
            mockRepository as never,
            mockLogger as unknown as LoggerService,
            new BenefitMapper()
        );
    });

    it('debe usar limit por defecto cuando pagination no tiene limit', async () => {
        const entity = BenefitEntity.create({
            codCompania: '20002',
            codSistema: 'NS',
            codCobertura: '4',
            codSubTipoCobertura: '100',
            codBeneficio: 'B001',
            desBeneficio: 'Test',
            estRegistro: 'V',
        });
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [entity],
            meta: { itemCount: 1, pageSize: BENEFIT_MAX_LIMIT, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        });

        const request = {
            filters: { codCompania: '20002' },
        };
        const result = await useCase.execute(request as never);

        expect(mockRepository.findByFiltersPaginated).toHaveBeenCalledWith(
            {
                codCompania: '20002',
                codSistema: undefined,
                codTipoCobertura: undefined,
                codSubtipoCobertura: undefined,
                estRegistro: undefined,
            },
            { cursor: undefined, pageSize: BENEFIT_MAX_LIMIT }
        );
        expect(result.data).toHaveLength(1);
        expect(result.data[0].codBeneficio).toBe('B001');
        expect(result.meta.pageSize).toBe(BENEFIT_MAX_LIMIT);
    });

    it('debe pasar cursor y pageSize personalizado cuando se envían en request', async () => {
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [],
            meta: { itemCount: 0, pageSize: 50, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        });

        const request = {
            filters: { codSistema: 'NS' },
            pagination: { limit: 50, cursor: 'eyJhbGc...' },
        };
        await useCase.execute(request as never);

        expect(mockRepository.findByFiltersPaginated).toHaveBeenCalledWith(expect.any(Object), {
            cursor: 'eyJhbGc...',
            pageSize: 50,
        });
    });

    it('debe devolver data, meta y cursors de la respuesta del repositorio', async () => {
        const entity = BenefitEntity.create({
            codCompania: null,
            codSistema: 'NS',
            codCobertura: null,
            codSubTipoCobertura: null,
            codBeneficio: 'B1',
            desBeneficio: 'Ben',
            estRegistro: 'V',
        });
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [entity],
            meta: { itemCount: 1, pageSize: 10, hasNextPage: true, hasPreviousPage: false },
            cursors: { nextCursor: 'next_cur', previousCursor: null },
        });

        const result = await useCase.execute({
            filters: {},
            pagination: { limit: 10 },
        } as never);

        expect(result.data).toHaveLength(1);
        expect(result.meta.hasNextPage).toBe(true);
        expect(result.cursors.nextCursor).toBe('next_cur');
    });

    it('debe usar request.filters cuando está definido (todas las claves en appliedFilters)', async () => {
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [],
            meta: { itemCount: 0, pageSize: 10, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        });
        await useCase.execute({
            filters: {
                codCompania: '1',
                codSistema: 'NS',
                codTipoCobertura: '4',
                codSubtipoCobertura: '100',
                estRegistro: 'V',
            },
            pagination: { limit: 10 },
        } as never);
        expect(mockRepository.findByFiltersPaginated).toHaveBeenCalledWith(
            expect.objectContaining({
                codCompania: '1',
                codSistema: 'NS',
                codTipoCobertura: '4',
                codSubtipoCobertura: '100',
                estRegistro: 'V',
            }),
            expect.any(Object)
        );
    });

    it('debe usar objeto vacío de filtros cuando request.filters es undefined', async () => {
        mockRepository.findByFiltersPaginated.mockResolvedValue({
            data: [],
            meta: { itemCount: 0, pageSize: BENEFIT_MAX_LIMIT, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        });
        await useCase.execute({ pagination: { limit: 20 } } as never);
        expect(mockRepository.findByFiltersPaginated).toHaveBeenCalledWith(
            {
                codCompania: undefined,
                codSistema: undefined,
                codTipoCobertura: undefined,
                codSubtipoCobertura: undefined,
                estRegistro: undefined,
            },
            { cursor: undefined, pageSize: 20 }
        );
    });
});
