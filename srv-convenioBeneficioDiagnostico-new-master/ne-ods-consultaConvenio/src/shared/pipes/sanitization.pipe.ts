import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import { ERROR_MESSAGE_KEYS, translate } from '../services/translation.service';
import { translateAndFormat } from '../utils/error-message.utils';

@Injectable()
export class SanitizationPipe implements PipeTransform {
    private readonly controlCharPattern: RegExp;

    private readonly dangerousPatterns = [
        /<script[\s\S]*?<\/\s*script[\s\S]*?>/gi,
        /<iframe[\s\S]*?<\/\s*iframe[\s\S]*?>/gi,
        /<object[\s\S]*?<\/\s*object[\s\S]*?>/gi,
        /<embed\b[^>]*>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,

        /<\?xml[^>]*\?>/gi,
        /<!DOCTYPE[^>]*>/gi,

        /(\bOR\b|\bAND\b)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/gi,
        /;\s*(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE)\s+/gi,
        /--\s*$/gm,
        /\/\*[\s\S]*?\*\//g,
    ];

    private readonly limits = {
        maxStringLength: 10000,
        maxArrayLength: 1000,
        maxObjectDepth: 10,
        maxNumberValue: Number.MAX_SAFE_INTEGER,
        minNumberValue: Number.MIN_SAFE_INTEGER,
    };

    constructor() {
        const controlCharCodes = [
            ...Array.from({ length: 9 }, (_, i) => i),
            0x0b,
            0x0c,
            ...Array.from({ length: 18 }, (_, i) => i + 0x0e),
            0x7f,
        ];
        this.controlCharPattern = new RegExp(`[${controlCharCodes.map(code => String.fromCharCode(code)).join('')}]`);
    }

    transform(value: unknown) {
        return this.sanitizeRecursive(value, 0);
    }

    private sanitizeRecursive(value: unknown, depth: number = 0) {
        if (depth > this.limits.maxObjectDepth) {
            throw new BadRequestException(
                translateAndFormat(ERROR_MESSAGE_KEYS.DATA_STRUCTURE_TOO_NESTED, {
                    max: this.limits.maxObjectDepth,
                })
            );
        }

        if (value === null || value === undefined) {
            return value;
        }

        if (typeof value === 'string') {
            return this.sanitizeString(value);
        }

        if (typeof value === 'number') {
            return this.sanitizeNumber(value);
        }

        if (Array.isArray(value)) {
            return this.sanitizeArray(value, depth);
        }

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return this.sanitizeObject(value as Record<string, unknown>, depth);
        }

        return value;
    }

    private sanitizeString(value: string): string {
        if (value.length > this.limits.maxStringLength) {
            throw new BadRequestException(
                translateAndFormat(ERROR_MESSAGE_KEYS.FIELD_EXCEEDS_MAX_LENGTH, {
                    max: this.limits.maxStringLength,
                })
            );
        }

        if (/<|>/.test(value)) {
            throw new BadRequestException(translate(ERROR_MESSAGE_KEYS.HTML_CHARACTERS_NOT_ALLOWED));
        }

        for (const pattern of this.dangerousPatterns) {
            if (pattern.test(value)) {
                throw new BadRequestException(translate(ERROR_MESSAGE_KEYS.DANGEROUS_PATTERNS_DETECTED));
            }
        }

        if (this.hasSuspiciousCharacters(value)) {
            throw new BadRequestException(translate(ERROR_MESSAGE_KEYS.SUSPICIOUS_CHARACTERS_DETECTED));
        }

        return value;
    }

    private sanitizeNumber(value: number): number {
        if (!Number.isFinite(value)) {
            throw new BadRequestException(translate(ERROR_MESSAGE_KEYS.INVALID_NUMERIC_VALUE));
        }

        if (value > this.limits.maxNumberValue || value < this.limits.minNumberValue) {
            throw new BadRequestException(
                translateAndFormat(ERROR_MESSAGE_KEYS.NUMERIC_VALUE_OUT_OF_RANGE, {
                    min: this.limits.minNumberValue,
                    max: this.limits.maxNumberValue,
                })
            );
        }

        return value;
    }

    private sanitizeArray(value: unknown[], depth: number): unknown[] {
        if (value.length > this.limits.maxArrayLength) {
            throw new BadRequestException(
                translateAndFormat(ERROR_MESSAGE_KEYS.ARRAY_TOO_LONG, {
                    max: this.limits.maxArrayLength,
                })
            );
        }

        return value.map((item, index) => {
            try {
                return this.sanitizeRecursive(item, depth + 1);
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                throw new BadRequestException(
                    translateAndFormat(ERROR_MESSAGE_KEYS.ARRAY_ELEMENT_ERROR, {
                        index: index,
                        error: msg,
                    })
                );
            }
        });
    }

    private sanitizeObject(value: Record<string, unknown>, depth: number): Record<string, unknown> {
        const sanitized: Record<string, unknown> = {};
        const keys = Object.keys(value);

        if (keys.length > 100) {
            throw new BadRequestException(
                translateAndFormat(ERROR_MESSAGE_KEYS.OBJECT_TOO_MANY_PROPERTIES, {
                    max: 100,
                })
            );
        }

        for (const key of keys) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                this.validateKey(key);

                try {
                    sanitized[key] = this.sanitizeRecursive(value[key], depth + 1);
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    throw new BadRequestException(
                        translateAndFormat(ERROR_MESSAGE_KEYS.OBJECT_PROPERTY_ERROR, {
                            property: key,
                            error: msg,
                        })
                    );
                }
            }
        }

        return sanitized;
    }

    private validateKey(key: string): void {
        if (key.length > this.limits.maxStringLength) {
            throw new BadRequestException(
                translateAndFormat(ERROR_MESSAGE_KEYS.FIELD_EXCEEDS_MAX_LENGTH, {
                    max: this.limits.maxStringLength,
                })
            );
        }

        if (/<|>/.test(key)) {
            throw new BadRequestException(translate(ERROR_MESSAGE_KEYS.HTML_CHARACTERS_NOT_ALLOWED));
        }

        for (const pattern of this.dangerousPatterns) {
            if (pattern.test(key)) {
                throw new BadRequestException(translate(ERROR_MESSAGE_KEYS.DANGEROUS_PATTERNS_DETECTED));
            }
        }

        if (this.hasSuspiciousCharacters(key)) {
            throw new BadRequestException(translate(ERROR_MESSAGE_KEYS.SUSPICIOUS_CHARACTERS_DETECTED));
        }
    }

    private hasSuspiciousCharacters(value: string): boolean {
        // Detectar múltiples comillas seguidas
        if (/'{2,}|"{2,}/.test(value)) {
            return true;
        }

        if (/[<>]=?[<>]/.test(value)) {
            return true;
        }

        // Detectar múltiples guiones seguidos (posible SQL comment)
        if (/--{2,}/.test(value)) {
            return true;
        }

        if (this.controlCharPattern.test(value)) {
            return true;
        }

        // Detectar patrones de inyección de comandos
        if (/[;&|`$(){}[\]\\]/.test(value)) {
            return true;
        }

        return false;
    }
}
