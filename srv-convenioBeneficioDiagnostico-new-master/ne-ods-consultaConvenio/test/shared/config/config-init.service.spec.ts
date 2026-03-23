// ...existing code...
import { LoggerService } from '@shared/logger/logger.service';
import { ConfigInitService } from '@/shared/config/config-init.service';
import { INFRASTRUCTURE_CONSTANTS } from '@/shared/constants/app.constants';

describe('ConfigInitService', () => {
    let service: ConfigInitService;
    let mockConfigService: { get: jest.Mock };
    let mockConfigClientService: { onModuleInit: jest.Mock } | null;
    let mockLogger: { withContext: jest.Mock; info: jest.Mock; debug: jest.Mock; warn: jest.Mock };

    beforeEach(() => {
        mockConfigService = {
            get: jest.fn((key: string) => {
                const map: Record<string, unknown> = {
                    'config.server.url': 'http://config-server',
                    'node.env': 'desa',
                    'server.port': 4040,
                    'database.host': 'localhost',
                    'database.port': 1433,
                    'database.name': 'db',
                    'database.schema': 'dbo',
                    'jwt.secret': 'test-secret',
                    'redis.host': 'localhost',
                    'redis.port': 6379,
                    'redis.ttl': 3600,
                };
                return map[key];
            }),
        };
        mockConfigClientService = { onModuleInit: jest.fn().mockResolvedValue(undefined) };
        mockLogger = {
            withContext: jest.fn().mockReturnThis(),
            info: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
        };
        service = new ConfigInitService(
            mockConfigClientService as never,
            mockConfigService as never,
            mockLogger as unknown as LoggerService
        );
    });

    it('debe exponer configServerUrl desde config', async () => {
        await service.ensureInitialized();
        expect(service.configServerUrl).toBe('http://config-server');
    });

    it('debe exponer nodeEnv con fallback a DEVELOPMENT', async () => {
        const originalGet = mockConfigService.get.getMockImplementation();
        mockConfigService.get.mockImplementation((key: string) =>
            key === 'node.env'
                ? undefined
                : (originalGet?.(key) ?? (key === 'config.server.url' ? 'http://config-server' : undefined))
        );
        await service.ensureInitialized();
        expect(service.nodeEnv).toBe(INFRASTRUCTURE_CONSTANTS.ENVIRONMENT.DEVELOPMENT);
    });

    it('debe exponer port desde config', async () => {
        await service.ensureInitialized();
        expect(service.port).toBe(4040);
    });

    it('debe exponer databaseConfig', async () => {
        await service.ensureInitialized();
        const db = service.databaseConfig;
        expect(db).toEqual({
            host: 'localhost',
            port: 1433,
            name: 'db',
            schema: 'dbo',
        });
    });

    it('debe exponer jwtSecret con fallback', async () => {
        const baseMap: Record<string, unknown> = {
            'config.server.url': 'http://config-server',
            'node.env': 'desa',
            'server.port': 4040,
            'database.host': 'localhost',
            'database.port': 1433,
            'database.name': 'db',
            'database.schema': 'dbo',
            'redis.host': 'localhost',
            'redis.port': 6379,
            'redis.ttl': 3600,
        };
        mockConfigService.get.mockImplementation((k: string) => (k === 'jwt.secret' ? undefined : baseMap[k]));
        await service.ensureInitialized();
        expect(service.jwtSecret).toContain('default-cursor-secret');
    });

    it('debe exponer redisConfig con valores por defecto', async () => {
        await service.ensureInitialized();
        const redis = service.redisConfig;
        expect(redis.host).toBe('localhost');
        expect(redis.port).toBe(6379);
        expect(redis.ttl).toBe(3600);
    });

    it('get debe delegar en configService tras inicializar', async () => {
        mockConfigService.get.mockReturnValue('valor');
        const result = await service.get<string>('some.key');
        expect(result).toBe('valor');
    });

    it('has debe devolver true si la clave existe', async () => {
        mockConfigService.get.mockReturnValue('algo');
        expect(await service.has('key')).toBe(true);
    });

    it('has debe devolver false si la clave no existe', async () => {
        mockConfigService.get.mockReturnValue(undefined);
        expect(await service.has('missing')).toBe(false);
    });

    it('no debe volver a inicializar si ya está inicializado', async () => {
        await service.ensureInitialized();
        expect(mockConfigClientService?.onModuleInit).toHaveBeenCalledTimes(1);
        await service.ensureInitialized();
        expect(mockConfigClientService?.onModuleInit).toHaveBeenCalledTimes(1);
    });

    it('debe exponer nodeEnv desde config cuando está definido', async () => {
        const base: Record<string, unknown> = {
            'config.server.url': 'http://x',
            'server.port': 4040,
            'database.host': 'h',
            'database.port': 1433,
            'database.name': 'n',
            'database.schema': 's',
            'redis.host': 'localhost',
            'redis.port': 6379,
            'redis.ttl': 3600,
        };
        mockConfigService.get.mockImplementation((k: string) => (k === 'node.env' ? 'prod' : base[k]));
        await service.ensureInitialized();
        expect(service.nodeEnv).toBe('prod');
    });

    it('isConfigServerAvailable debe ser true cuando onModuleInit resuelve', async () => {
        await service.ensureInitialized();
        expect(service.isConfigServerAvailable()).toBe(true);
    });

    it('isConfigServerAvailable debe ser false cuando onModuleInit rechaza', async () => {
        mockConfigClientService?.onModuleInit.mockRejectedValue(new Error('Network error'));
        service = new ConfigInitService(
            mockConfigClientService as never,
            mockConfigService as never,
            mockLogger as unknown as LoggerService
        );
        await service.ensureInitialized();
        expect(service.isConfigServerAvailable()).toBe(false);
    });

    it('cuando ConfigClientService es null debe usar solo configuración local y loguear warn', async () => {
        service = new ConfigInitService(
            null as never,
            mockConfigService as never,
            mockLogger as unknown as LoggerService
        );
        await service.ensureInitialized();
        expect(service.isConfigServerAvailable()).toBe(false);
        expect(mockLogger.warn).toHaveBeenCalledWith(
            'ConfigClientService no inyectado, usando solo configuración local'
        );
    });

    it('debe usar DEFAULT_HOST en redisConfig cuando redis.host no está definido', async () => {
        mockConfigService.get.mockImplementation((k: string) => {
            const m: Record<string, unknown> = {
                'config.server.url': 'http://x',
                'node.env': 'desa',
                'server.port': 4040,
                'database.host': 'h',
                'database.port': 1433,
                'database.name': 'n',
                'database.schema': 's',
                'redis.port': 6379,
                'redis.ttl': 3600,
            };
            return m[k];
        });
        await service.ensureInitialized();
        expect(service.redisConfig.host).toBe(INFRASTRUCTURE_CONSTANTS.REDIS.DEFAULT_HOST);
    });

    it('debe exponer azureADCredentials desde config', async () => {
        mockConfigService.get.mockImplementation((k: string) => {
            const m: Record<string, string> = {
                'config.server.url': 'http://x',
                'node.env': 'desa',
                'server.port': '4040',
                'database.host': 'h',
                'database.port': '1433',
                'database.name': 'n',
                'database.schema': 's',
                'azure.tenant_id': 'tenant',
                'azure.client_id': 'client',
                'azure.client_secret': 'secret',
                'redis.host': 'localhost',
                'redis.port': '6379',
                'redis.ttl': '3600',
            };
            return m[k];
        });
        await service.ensureInitialized();
        expect(service.azureADCredentials).toEqual({
            tenantId: 'tenant',
            clientId: 'client',
            clientSecret: 'secret',
        });
    });
});
