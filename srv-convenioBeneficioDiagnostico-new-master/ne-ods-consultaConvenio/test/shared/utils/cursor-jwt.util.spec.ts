import { BadRequestException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CursorJwtUtil } from '@/shared/utils/cursor-jwt.util';

const SECRET = 'test-secret-key-for-jwt';

describe('CursorJwtUtil', () => {
    describe('encode', () => {
        it('debe generar un token válido con id y direction', () => {
            const token = CursorJwtUtil.encode('item-123', 'next', SECRET);
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);
        });

        it('debe lanzar error si id está vacío', () => {
            expect(() => CursorJwtUtil.encode('', 'next', SECRET)).toThrow('ID and secret are required');
        });

        it('debe lanzar error si secret está vacío', () => {
            expect(() => CursorJwtUtil.encode('id', 'next', '')).toThrow('ID and secret are required');
        });

        it('debe lanzar error cuando jwt.sign falla', () => {
            const signSpy = jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
                throw new Error('sign failed');
            });
            expect(() => CursorJwtUtil.encode('id', 'next', SECRET)).toThrow('Failed to encode cursor');
            signSpy.mockRestore();
        });
    });

    describe('decode', () => {
        it('debe decodificar un token generado por encode', () => {
            const token = CursorJwtUtil.encode('item-456', 'prev', SECRET);
            const decoded = CursorJwtUtil.decode(token, SECRET);
            expect(decoded.id).toBe('item-456');
            expect(decoded.direction).toBe('prev');
        });

        it('debe lanzar BadRequestException si token está vacío', () => {
            expect(() => CursorJwtUtil.decode('', SECRET)).toThrow(BadRequestException);
        });

        it('debe lanzar BadRequestException si secret está vacío', () => {
            const token = CursorJwtUtil.encode('id', 'next', SECRET);
            expect(() => CursorJwtUtil.decode(token, '')).toThrow(BadRequestException);
        });

        it('debe lanzar BadRequestException si el token está adulterado', () => {
            const token = CursorJwtUtil.encode('id', 'next', SECRET);
            const tampered = `${token.slice(0, -2)}xx`;
            expect(() => CursorJwtUtil.decode(tampered, SECRET)).toThrow(BadRequestException);
        });

        it('debe lanzar BadRequestException si el token tiene dirección inválida', () => {
            const token = CursorJwtUtil.encode('id', 'next', SECRET);
            expect(() => CursorJwtUtil.decode(token, 'wrong-secret')).toThrow(BadRequestException);
        });

        it('debe lanzar BadRequestException cuando payload carece de id (CURSOR_INVALID_DATA)', () => {
            const token = jwt.sign({ direction: 'next', timestamp: Math.floor(Date.now() / 1000) + 3600 }, SECRET, {
                algorithm: 'HS256',
            });
            expect(() => CursorJwtUtil.decode(token, SECRET)).toThrow(BadRequestException);
        });

        it('debe lanzar BadRequestException cuando payload carece de direction (CURSOR_INVALID_DATA)', () => {
            const token = jwt.sign({ id: 'x', timestamp: Math.floor(Date.now() / 1000) + 3600 }, SECRET, {
                algorithm: 'HS256',
            });
            expect(() => CursorJwtUtil.decode(token, SECRET)).toThrow(BadRequestException);
        });

        it('debe lanzar BadRequestException cuando direction no es next ni prev (CURSOR_INVALID_DIRECTION)', () => {
            const token = jwt.sign(
                { id: 'x', direction: 'invalid', timestamp: Math.floor(Date.now() / 1000) + 3600 },
                SECRET,
                { algorithm: 'HS256' }
            );
            expect(() => CursorJwtUtil.decode(token, SECRET)).toThrow(BadRequestException);
        });

        it('debe lanzar BadRequestException para token expirado (CURSOR_EXPIRED)', () => {
            const token = jwt.sign(
                { id: 'x', direction: 'next', timestamp: Math.floor(Date.now() / 1000) - 10 },
                SECRET,
                { algorithm: 'HS256', expiresIn: '-1s' }
            );
            expect(() => CursorJwtUtil.decode(token, SECRET)).toThrow(BadRequestException);
        });

        it('debe lanzar BadRequestException con CURSOR_DECODE_ERROR para error genérico de jwt.verify', () => {
            const verifySpy = jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
                throw new Error('Unknown JWT error');
            });
            expect(() => CursorJwtUtil.decode('any-token', SECRET)).toThrow(BadRequestException);
            verifySpy.mockRestore();
        });
    });

    describe('encode + decode roundtrip', () => {
        it('next roundtrip', () => {
            const token = CursorJwtUtil.encode('cursor-id', 'next', SECRET);
            const decoded = CursorJwtUtil.decode(token, SECRET);
            expect(decoded.id).toBe('cursor-id');
            expect(decoded.direction).toBe('next');
        });

        it('prev roundtrip', () => {
            const token = CursorJwtUtil.encode('cursor-id', 'prev', SECRET);
            const decoded = CursorJwtUtil.decode(token, SECRET);
            expect(decoded.direction).toBe('prev');
        });
    });
});
