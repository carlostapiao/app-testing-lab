/**
 * Parámetros crudos para crear la entidad (resultado de query).
 */
export interface BenefitEntityParams {
    codCompania: string | null;
    codSistema: string | null;
    codCobertura: string | null;
    codSubTipoCobertura: string | null;
    codBeneficio: string | null;
    desBeneficio: string | null;
    estRegistro: string | null;
}

export class BenefitEntity {
    private constructor(
        private readonly _codCompania: string | null,
        private readonly _codSistema: string | null,
        private readonly _codCobertura: string | null,
        private readonly _codSubTipoCobertura: string | null,
        private readonly _codBeneficio: string | null,
        private readonly _desBeneficio: string | null,
        private readonly _estRegistro: string | null
    ) {}

    public static create(params: BenefitEntityParams): BenefitEntity {
        return new BenefitEntity(
            params.codCompania ?? null,
            params.codSistema ?? null,
            params.codCobertura ?? null,
            params.codSubTipoCobertura ?? null,
            params.codBeneficio ?? null,
            params.desBeneficio ?? null,
            params.estRegistro ?? null
        );
    }

    public get codCompania(): string | null {
        return this._codCompania;
    }

    public get codSistema(): string | null {
        return this._codSistema;
    }

    public get codCobertura(): string | null {
        return this._codCobertura;
    }

    public get codSubTipoCobertura(): string | null {
        return this._codSubTipoCobertura;
    }

    public get codBeneficio(): string | null {
        return this._codBeneficio;
    }

    public get desBeneficio(): string | null {
        return this._desBeneficio;
    }

    public get estRegistro(): string | null {
        return this._estRegistro;
    }
}
