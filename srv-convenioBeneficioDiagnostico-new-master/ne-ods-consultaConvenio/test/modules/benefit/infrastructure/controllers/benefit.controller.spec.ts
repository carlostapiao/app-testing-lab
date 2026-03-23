import { QueryBenefitsUseCase } from '@modules/benefit/application/use-cases/query-benefits.use-case';
import { HttpHeaders } from '@shared/constants/http-headers.constants';
import { LoggerService } from '@shared/logger/logger.service';
import { BenefitController } from '@/modules/benefit/infrastructure/controllers/benefit.controller';

describe('BenefitController', () => {
    let controller: BenefitController;
    let mockQueryBenefitsUseCase: jest.Mocked<QueryBenefitsUseCase>;
    let mockLogger: { withContext: jest.Mock; info: jest.Mock };

    const mockHeaders = {
        [HttpHeaders.X_CORRELATION_ID]: 'corr-123',
    } as never;

    beforeEach(() => {
        mockLogger = { withContext: jest.fn().mockReturnThis(), info: jest.fn() };
        mockQueryBenefitsUseCase = {
            execute: jest.fn(),
        } as never;
        controller = new BenefitController(mockLogger as unknown as LoggerService, mockQueryBenefitsUseCase);
    });

    it('debe llamar al use case y retornar la respuesta de beneficios', async () => {
        const request = { filters: { codCompania: '20002' }, pagination: { limit: 100 } };
        const expectedResponse = {
            data: [
                {
                    codBeneficio: 'B001',
                    desBeneficio: 'Test',
                    codCompania: '20002',
                    codSistema: null,
                    codTipoCobertura: null,
                    codSubTipoCobertura: null,
                    estRegistro: null,
                },
            ],
            meta: { itemCount: 1, pageSize: 100, hasNextPage: false, hasPreviousPage: false },
            cursors: { nextCursor: null, previousCursor: null },
        };
        mockQueryBenefitsUseCase.execute.mockResolvedValue(expectedResponse);

        const result = await controller.queryBenefits(request as never, mockHeaders);

        expect(mockQueryBenefitsUseCase.execute).toHaveBeenCalledWith(request);
        expect(result).toEqual(expectedResponse);
        expect(mockLogger.info).toHaveBeenCalled();
    });
});
