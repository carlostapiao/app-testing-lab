import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { HttpHeaders } from '@/shared/constants/http-headers.constants';
import { resolveRequestHeader } from '@/shared/decorators/request-header.decorator';
import { HeadersDto } from '@/shared/dtos/headers.dto';

const uuidV4 = 'a1b2c3d4-e5f6-4789-a012-345678901234';

describe('RequestHeader / resolveRequestHeader', () => {
    it('debe devolver HeadersDto cuando los headers son válidos', async () => {
        const headers = {
            [HttpHeaders.OCP_APIM_SUBSCRIPTION_KEY]: 'sub-key',
            [HttpHeaders.X_CORRELATION_ID]: uuidV4,
            [HttpHeaders.X_REQUEST_ID]: uuidV4,
            [HttpHeaders.NOMBRE_APLICACION]: 'app',
            [HttpHeaders.PROCESO_NEGOCIO]: 'proc',
            [HttpHeaders.USUARIO_APLICACION]: 'user',
        };
        const ctx = {
            switchToHttp: () => ({ getRequest: () => ({ headers }) }),
        } as unknown as ExecutionContext;
        const result = await resolveRequestHeader(HeadersDto, ctx);
        expect(result).toBeInstanceOf(HeadersDto);
        expect((result as HeadersDto)[HttpHeaders.OCP_APIM_SUBSCRIPTION_KEY]).toBe('sub-key');
    });

    it('debe lanzar BadRequestException cuando los headers no pasan validación', async () => {
        const ctx = {
            switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
        } as unknown as ExecutionContext;
        await expect(resolveRequestHeader(HeadersDto, ctx)).rejects.toThrow(BadRequestException);
    });
});
