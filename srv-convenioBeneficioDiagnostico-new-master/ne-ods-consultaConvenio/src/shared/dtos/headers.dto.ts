import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { HttpHeaders } from '../constants/http-headers.constants';

export class HeadersDto {
    @Expose()
    @IsNotEmpty()
    @IsString()
    [HttpHeaders.OCP_APIM_SUBSCRIPTION_KEY]: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsUUID('4')
    [HttpHeaders.X_CORRELATION_ID]: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsUUID('4')
    [HttpHeaders.X_REQUEST_ID]: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    [HttpHeaders.NOMBRE_APLICACION]: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    [HttpHeaders.PROCESO_NEGOCIO]: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    [HttpHeaders.USUARIO_APLICACION]: string;
}
