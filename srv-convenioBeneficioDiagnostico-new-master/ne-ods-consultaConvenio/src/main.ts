import helmet from '@fastify/helmet';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigInitService } from '@shared/config/config-init.service';
import { NestLoggerAdapter } from '@shared/logger/nest-logger.adapter';
import { AppModule } from './app.module';
import { DEFAULT_LOCALE } from './shared/constants/locale.enum';

const BODY_LIMIT = 1048576; // 1MB

async function bootstrap() {
    const fastifyAdapter = new FastifyAdapter({
        bodyLimit: BODY_LIMIT,
        routerOptions: {
            ignoreTrailingSlash: true,
        },
    });

    const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
        bufferLogs: true,
        rawBody: true,
    });

    const configService = app.get(ConfigInitService);
    const logger = app.get(NestLoggerAdapter);

    app.useLogger(logger);
    app.flushLogs();

    logger.log(`I18n configured - Default locale: ${DEFAULT_LOCALE}, Supported: en-US, es-PE`);

    const instance = app.getHttpAdapter().getInstance();

    await instance.register(helmet as never, {
        contentSecurityPolicy: false,
    });

    app.setGlobalPrefix('ms-ne-consulta-convenioBeneficioDiagnosticos-ssd/convenios-beneficio-diagnostico');
    app.enableVersioning({
        type: VersioningType.URI,
        prefix: 'v',
        defaultVersion: '1.0.0',
    });

    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        optionsSuccessStatus: 200,
    });

    const config = new DocumentBuilder()
        .setTitle('api-oc-ne-consulta-convenioBeneficioDiagnosticos-ssd')
        .setDescription('API para la consulta de convenios de beneficio y diagnósticos.')
        .setVersion('1.0.0')
        .addServer(
            'http://localhost:4040/ms-ne-consulta-convenioBeneficioDiagnosticos-ssd/convenios-beneficio-diagnostico/v1.0.0',
            'Servidor Local'
        )
        .addServer(
            'https://apim-eu1-border-service-desa.azure-api.net/ne-consulta-convenioBeneficioDiagnosticos-ssd/convenios-beneficio-diagnostico/v1.0.0',
            'Servidor de Desarrollo'
        )
        .addServer(
            'https://apim-eu1-border-services-test.azure-api.net/ne-consulta-convenioBeneficioDiagnosticos-ssd/convenios-beneficio-diagnostico/v1.0.0',
            'Servidor de Test'
        )
        .addServer(
            'https://apim-eu1-border-services-prd.azure-api.net/ne-consulta-convenioBeneficioDiagnosticos-ssd/convenios-beneficio-diagnostico/v1.0.0',
            'Servidor de Producción'
        )
        .addApiKey(
            {
                type: 'apiKey',
                name: 'ocp-apim-subscription-key',
                in: 'header',
            },
            'api_key'
        )
        .addTag('Beneficios', 'Operaciones relacionadas con beneficios')
        .addTag('Diagnosticos', 'Operaciones relacionadas con diagnósticos')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = configService.port;
    await app.listen(port, '0.0.0.0');

    logger.log(`Aplicación ejecutándose en puerto ${port}`);
}

bootstrap();
