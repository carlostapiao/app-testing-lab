import { INFRASTRUCTURE_CONSTANTS } from '@/shared/constants/app.constants';

describe('app.constants', () => {
    it('debe exportar INFRASTRUCTURE_CONSTANTS con valores esperados', () => {
        expect(INFRASTRUCTURE_CONSTANTS.ENVIRONMENT.DEVELOPMENT).toBe('desa');
        expect(INFRASTRUCTURE_CONSTANTS.ENVIRONMENT.PRODUCTION).toBe('prod');
        expect(INFRASTRUCTURE_CONSTANTS.SERVER.DEFAULT_PORT).toBe(4040);
        expect(INFRASTRUCTURE_CONSTANTS.DATABASE.DEFAULT_PORT).toBe(1433);
        expect(INFRASTRUCTURE_CONSTANTS.REDIS.DEFAULT_HOST).toBe('localhost');
        expect(INFRASTRUCTURE_CONSTANTS.REDIS.DEFAULT_PORT).toBe(6379);
        expect(INFRASTRUCTURE_CONSTANTS.REDIS.DEFAULT_TTL).toBe(3600);
    });
});
