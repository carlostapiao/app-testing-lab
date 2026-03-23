import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

/**
 * Estándar de ordenamiento para cuerpos de búsqueda/listado.
 * Uso: dentro de { sort: { field, order } }.
 */
export class SortDto {
    @ApiPropertyOptional({
        description: 'Campo por el cual ordenar',
        example: 'createdAt',
    })
    @IsOptional()
    @IsString()
    readonly field?: string;

    @ApiPropertyOptional({
        description: 'Dirección del orden',
        enum: ['asc', 'desc'],
        example: 'desc',
    })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    readonly order?: 'asc' | 'desc' = 'desc';
}
