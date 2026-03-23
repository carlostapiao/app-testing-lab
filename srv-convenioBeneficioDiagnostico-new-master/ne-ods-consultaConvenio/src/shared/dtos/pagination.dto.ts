import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Estándar de paginación para cuerpos de búsqueda/listado.
 * Uso: dentro de { pagination: { limit, cursor? } }.
 */
export class PaginationDto {
    @ApiPropertyOptional({
        description: 'Número de registros por página (limit)',
        minimum: 1,
        maximum: 100,
        default: 10,
        example: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @Transform(({ value }) => (value ? parseInt(String(value), 10) : 10))
    readonly limit: number = 10;

    @ApiPropertyOptional({
        description: 'Cursor opaco para paginación keyset (nextCursor o previousCursor de la respuesta anterior)',
        type: String,
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsOptional()
    @IsString()
    readonly cursor?: string;
}
