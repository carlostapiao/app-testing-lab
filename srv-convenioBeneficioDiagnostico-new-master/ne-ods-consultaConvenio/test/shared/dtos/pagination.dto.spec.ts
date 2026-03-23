import { PaginationDto } from '@/shared/dtos/pagination.dto';

describe('PaginationDto', () => {
    it('debe tener limit por defecto 10 y cursor opcional', () => {
        const dto = new PaginationDto();
        expect(dto.limit).toBe(10);
        expect(dto.cursor).toBeUndefined();
    });

    it('debe aceptar limit y cursor', () => {
        const dto = Object.assign(new PaginationDto(), { limit: 20, cursor: 'abc' });
        expect(dto.limit).toBe(20);
        expect(dto.cursor).toBe('abc');
    });
});
