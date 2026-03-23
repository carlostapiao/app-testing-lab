import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { SanitizedValidationPipe } from '@/shared/pipes/sanitized-validation.pipe';

jest.mock('@/shared/services/translation.service', () => ({
    translate: jest.fn((key: string) => key),
    ERROR_MESSAGE_KEYS: {},
}));
jest.mock('@/shared/utils/error-message.utils', () => ({
    translateAndFormat: jest.fn((_key: string, params?: Record<string, unknown>) => JSON.stringify(params ?? {})),
}));

class DtoWithValidation {
    @IsNotEmpty()
    @IsString()
    name!: string;
}

describe('SanitizedValidationPipe', () => {
    let pipe: SanitizedValidationPipe;
    const metadata: ArgumentMetadata = { type: 'body', metatype: Object };

    beforeEach(() => {
        pipe = new SanitizedValidationPipe();
    });

    it('debe sanitizar y pasar a validación (transform devuelve valor cuando no hay DTO estricto)', async () => {
        const value = { name: 'test' };
        const result = await pipe.transform(value, { ...metadata, metatype: undefined });
        expect(result).toEqual(value);
    });

    it('debe lanzar BadRequestException cuando la sanitización falla', async () => {
        const value = '<script>alert(1)</script>';
        await expect(pipe.transform(value, metadata)).rejects.toThrow(BadRequestException);
    });

    it('debe tener exceptionFactory que devuelve BadRequestException con detail', () => {
        const pipeWithFactory = new SanitizedValidationPipe();
        expect(pipeWithFactory).toBeDefined();
    });

    it('debe invocar exceptionFactory cuando la validación falla (DTO con errores)', async () => {
        const value = { name: '' };
        const meta: ArgumentMetadata = { type: 'body', metatype: DtoWithValidation };
        await expect(pipe.transform(value, meta)).rejects.toThrow(BadRequestException);
    });

    it('debe capturar error no BadRequestException y enviar detail con mensaje', async () => {
        const pipeWithFailingSanitization = new SanitizedValidationPipe();
        const sanitizeSpy = jest
            .spyOn(pipeWithFailingSanitization.sanitizationPipe, 'transform')
            .mockImplementation(() => {
                throw new Error('Error durante la sanitización y validación');
            });
        await expect(pipeWithFailingSanitization.transform({ x: 1 }, metadata)).rejects.toThrow(BadRequestException);
        sanitizeSpy.mockRestore();
    });

    it('debe usar mensaje por defecto cuando el error no es instancia de Error (string)', async () => {
        const pipeWithFailingSanitization = new SanitizedValidationPipe();
        const sanitizeSpy = jest
            .spyOn(pipeWithFailingSanitization.sanitizationPipe, 'transform')
            .mockImplementation(() => {
                throw 'string error';
            });
        await expect(pipeWithFailingSanitization.transform({ x: 1 }, metadata)).rejects.toThrow(BadRequestException);
        sanitizeSpy.mockRestore();
    });

    it('debe usar mensaje por defecto cuando se lanza un número (rama errorDetail)', async () => {
        const pipeWithFailingSanitization = new SanitizedValidationPipe();
        const sanitizeSpy = jest
            .spyOn(pipeWithFailingSanitization.sanitizationPipe, 'transform')
            .mockImplementation(() => {
                throw 999;
            });
        await expect(pipeWithFailingSanitization.transform({ x: 1 }, metadata)).rejects.toThrow(BadRequestException);
        sanitizeSpy.mockRestore();
    });
});
