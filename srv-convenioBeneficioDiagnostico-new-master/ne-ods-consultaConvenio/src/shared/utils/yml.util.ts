import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';

/**
 * Carga properties.local.yml de forma síncrona y devuelve la config (objeto anidado).
 * Usado en bootstrap (AppModule) antes de que exista el contenedor DI.
 * Sustituye ${VAR} por process.env[VAR]. Nest ConfigService espera estructura anidada.
 */
export function loadYmlConfigSync(): Record<string, unknown> {
    const yamlPath = path.join(process.cwd(), 'properties.local.yml');
    if (!fs.existsSync(yamlPath)) return {};

    try {
        let content = fs.readFileSync(yamlPath, 'utf8');
        content = content.replace(/\$\{([\w-]+)\}/g, (_match, varName: string) => {
            return process.env[varName] ?? _match;
        });
        const config = yaml.load(content) as Record<string, unknown>;
        return config ?? {};
    } catch {
        return {};
    }
}
