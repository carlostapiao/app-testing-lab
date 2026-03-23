/**
 * Parámetros crudos para crear la entidad (resultado de query).
 * codDiagnostico se usa también para paginación keyset (cursor), como en beneficios con codBeneficio.
 */
export interface DiagnosticEntityParams {
    codDiagnostico: string | null;
    desDiagnostico: string | null;
    estRegistro: string | null;
    codSistema: string | null;
}

export class DiagnosticEntity {
    private constructor(
        private readonly _codDiagnostico: string | null,
        private readonly _desDiagnostico: string | null,
        private readonly _estRegistro: string | null,
        private readonly _codSistema: string | null
    ) {}

    public static create(params: DiagnosticEntityParams): DiagnosticEntity {
        return new DiagnosticEntity(
            params.codDiagnostico ?? null,
            params.desDiagnostico ?? null,
            params.estRegistro ?? null,
            params.codSistema ?? null
        );
    }

    public get codDiagnostico(): string | null {
        return this._codDiagnostico;
    }

    public get desDiagnostico(): string | null {
        return this._desDiagnostico;
    }

    public get estRegistro(): string | null {
        return this._estRegistro;
    }

    public get codSistema(): string | null {
        return this._codSistema;
    }
}
