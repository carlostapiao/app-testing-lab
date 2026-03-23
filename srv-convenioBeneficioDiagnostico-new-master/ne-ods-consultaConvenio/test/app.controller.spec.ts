import { AppController } from '@/app.controller';

describe('AppController', () => {
    let controller: AppController;

    beforeEach(() => {
        controller = new AppController();
    });

    describe('getRoot', () => {
        it('debe retornar status ok y mensaje del microservicio', () => {
            const result = controller.getRoot();
            expect(result).toEqual({
                status: 'ok',
                message: 'Microservicio de consulta de convenios beneficio diagnóstico en ejecución',
                service: 'srv-ms-oc-ne-consulta-convenioBeneficioDiagnosticos-ssd',
                version: '1.0.0',
            });
        });

        it('debe incluir el nombre del servicio correcto', () => {
            const result = controller.getRoot();
            expect(result.service).toBe('srv-ms-oc-ne-consulta-convenioBeneficioDiagnosticos-ssd');
        });

        it('debe incluir la versión 1.0.0', () => {
            const result = controller.getRoot();
            expect(result.version).toBe('1.0.0');
        });
    });
});
