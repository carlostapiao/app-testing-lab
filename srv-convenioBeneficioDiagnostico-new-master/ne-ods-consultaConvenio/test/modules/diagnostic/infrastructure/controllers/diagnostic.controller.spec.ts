import { QueryDiagnosticBenefitsUseCase } from '@modules/diagnostic/application/use-cases/query-diagnostic-benefits.use-case';
import { QueryDiagnosticsUseCase } from '@modules/diagnostic/application/use-cases/query-diagnostics.use-case';
import { HttpHeaders } from '@shared/constants/http-headers.constants';
import { LoggerService } from '@shared/logger/logger.service';
import { DiagnosticController } from '@/modules/diagnostic/infrastructure/controllers/diagnostic.controller';

describe('DiagnosticController', () => {
    let controller: DiagnosticController;
    let mockQueryDiagnosticsUseCase: jest.Mocked<QueryDiagnosticsUseCase>;
    let mockQueryDiagnosticBenefitsUseCase: jest.Mocked<QueryDiagnosticBenefitsUseCase>;
    let mockLogger: { withContext: jest.Mock; info: jest.Mock };

    const mockHeaders = { [HttpHeaders.X_CORRELATION_ID]: 'corr-456' } as never;

    beforeEach(() => {
        mockLogger = { withContext: jest.fn().mockReturnThis(), info: jest.fn() };
        mockQueryDiagnosticsUseCase = { execute: jest.fn() } as never;
        mockQueryDiagnosticBenefitsUseCase = { execute: jest.fn() } as never;
        controller = new DiagnosticController(
            mockLogger as unknown as LoggerService,
            mockQueryDiagnosticsUseCase,
            mockQueryDiagnosticBenefitsUseCase
        );
    });

    describe('queryDiagnostics', () => {
        it('debe llamar al use case y retornar la respuesta de diagnósticos', async () => {
            const request = { filters: { codDiagnostico: ['D001'] } };
            const expectedResponse = {
                data: [{ codDiagnostico: 'D001', desDiagnostico: 'Diag', estRegistro: 'V', codSistema: 'NS' }],
                meta: { itemCount: 1, pageSize: 1000, hasNextPage: false, hasPreviousPage: false },
                cursors: { nextCursor: null, previousCursor: null },
            };
            mockQueryDiagnosticsUseCase.execute.mockResolvedValue(expectedResponse);

            const result = await controller.queryDiagnostics(request as never, mockHeaders);

            expect(mockQueryDiagnosticsUseCase.execute).toHaveBeenCalledWith(request);
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('queryDiagnosticBenefits', () => {
        it('debe llamar al use case y retornar la respuesta diagnósticos-beneficios', async () => {
            const request = { filters: { codBeneficio: 'B001' } };
            const expectedResponse = {
                data: [
                    {
                        codSistemaDiagnosticoBeneficio: null,
                        estDiagnosticoBeneficio: null,
                        codSistemaDiagnostico: null,
                        codDiagnostico: 'D001',
                        desDiagnostico: null,
                        estDiagnostico: null,
                        codSistemaBeneficio: null,
                        codBeneficio: 'B001',
                        desBeneficio: null,
                        estBeneficio: null,
                    },
                ],
                meta: { itemCount: 1, pageSize: 1000, hasNextPage: false, hasPreviousPage: false },
                cursors: { nextCursor: null, previousCursor: null },
            };
            mockQueryDiagnosticBenefitsUseCase.execute.mockResolvedValue(expectedResponse);

            const result = await controller.queryDiagnosticBenefits(request as never, mockHeaders);

            expect(mockQueryDiagnosticBenefitsUseCase.execute).toHaveBeenCalledWith(request);
            expect(result).toEqual(expectedResponse);
        });
    });
});
