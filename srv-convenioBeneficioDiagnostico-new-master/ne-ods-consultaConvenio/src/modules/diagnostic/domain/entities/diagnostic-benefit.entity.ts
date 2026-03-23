/**
 * Parámetros para crear la entidad (resultado de query diagnósticos-beneficios).
 * Keyset para paginación: combinación (codDiagnostico, codBeneficio).
 */
export interface DiagnosticBenefitEntityParams {
    codSistemaDiagnosticoBeneficio: string | null;
    estDiagnosticoBeneficio: string | null;
    codSistemaDiagnostico: string | null;
    codDiagnostico: string | null;
    desDiagnostico: string | null;
    estDiagnostico: string | null;
    codSistemaBeneficio: string | null;
    codBeneficio: string | null;
    desBeneficio: string | null;
    estBeneficio: string | null;
}

export class DiagnosticBenefitEntity {
    private constructor(
        private readonly _codSistemaDiagnosticoBeneficio: string | null,
        private readonly _estDiagnosticoBeneficio: string | null,
        private readonly _codSistemaDiagnostico: string | null,
        private readonly _codDiagnostico: string | null,
        private readonly _desDiagnostico: string | null,
        private readonly _estDiagnostico: string | null,
        private readonly _codSistemaBeneficio: string | null,
        private readonly _codBeneficio: string | null,
        private readonly _desBeneficio: string | null,
        private readonly _estBeneficio: string | null
    ) {}

    public static create(params: DiagnosticBenefitEntityParams): DiagnosticBenefitEntity {
        return new DiagnosticBenefitEntity(
            params.codSistemaDiagnosticoBeneficio ?? null,
            params.estDiagnosticoBeneficio ?? null,
            params.codSistemaDiagnostico ?? null,
            params.codDiagnostico ?? null,
            params.desDiagnostico ?? null,
            params.estDiagnostico ?? null,
            params.codSistemaBeneficio ?? null,
            params.codBeneficio ?? null,
            params.desBeneficio ?? null,
            params.estBeneficio ?? null
        );
    }

    get codSistemaDiagnosticoBeneficio(): string | null {
        return this._codSistemaDiagnosticoBeneficio;
    }
    get estDiagnosticoBeneficio(): string | null {
        return this._estDiagnosticoBeneficio;
    }
    get codSistemaDiagnostico(): string | null {
        return this._codSistemaDiagnostico;
    }
    get codDiagnostico(): string | null {
        return this._codDiagnostico;
    }
    get desDiagnostico(): string | null {
        return this._desDiagnostico;
    }
    get estDiagnostico(): string | null {
        return this._estDiagnostico;
    }
    get codSistemaBeneficio(): string | null {
        return this._codSistemaBeneficio;
    }
    get codBeneficio(): string | null {
        return this._codBeneficio;
    }
    get desBeneficio(): string | null {
        return this._desBeneficio;
    }
    get estBeneficio(): string | null {
        return this._estBeneficio;
    }
}
