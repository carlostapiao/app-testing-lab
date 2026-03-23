import { SortDto } from '@/shared/dtos/sort.dto';

describe('SortDto', () => {
    it('debe tener order por defecto desc', () => {
        const dto = new SortDto();
        expect(dto.order).toBe('desc');
        expect(dto.field).toBeUndefined();
    });

    it('debe aceptar field y order', () => {
        const dto = Object.assign(new SortDto(), { field: 'name', order: 'asc' as const });
        expect(dto.field).toBe('name');
        expect(dto.order).toBe('asc');
    });
});
