import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import { loadYmlConfigSync } from '@/shared/utils/yml.util';

jest.mock('node:fs');
jest.mock('node:path');

describe('yml.util', () => {
    const mockExistsSync = fs.existsSync as jest.Mock;
    const mockReadFileSync = fs.readFileSync as jest.Mock;
    const mockJoin = path.join as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockJoin.mockReturnValue('/cwd/properties.local.yml');
    });

    it('debe devolver {} cuando el archivo no existe', () => {
        mockExistsSync.mockReturnValue(false);
        expect(loadYmlConfigSync()).toEqual({});
        expect(mockReadFileSync).not.toHaveBeenCalled();
    });

    it(`debe cargar YAML y sustituir \${VAR} por process.env`, () => {
        mockExistsSync.mockReturnValue(true);
        mockReadFileSync.mockReturnValue(`port: \${PORT}`);
        process.env.PORT = '3000';
        try {
            jest.spyOn(yaml, 'load').mockReturnValue({ port: '3000' });
            expect(loadYmlConfigSync()).toEqual({ port: '3000' });
            expect(mockReadFileSync).toHaveBeenCalledWith('/cwd/properties.local.yml', 'utf8');
        } finally {
            delete process.env.PORT;
        }
    });

    it('debe devolver {} cuando yaml.load lanza', () => {
        mockExistsSync.mockReturnValue(true);
        mockReadFileSync.mockReturnValue('content');
        jest.spyOn(yaml, 'load').mockImplementation(() => {
            throw new Error('parse error');
        });
        expect(loadYmlConfigSync()).toEqual({});
    });

    it('debe devolver {} cuando load retorna null', () => {
        mockExistsSync.mockReturnValue(true);
        mockReadFileSync.mockReturnValue('content');
        jest.spyOn(yaml, 'load').mockReturnValue(null);
        expect(loadYmlConfigSync()).toEqual({});
    });
});
