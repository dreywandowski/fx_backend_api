import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app/app.module';
import { ErrorLogger } from './modules/utils/logger';
import { GlobalExceptionFilter } from './modules/common/filters/http-exception.filter';

const Logger = new ErrorLogger();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('app.port') ?? 5000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: false,
      exceptionFactory: (errors) => {
        return new HttpException(
          {
            status: false,
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Validation failed',
            errors: errors.map((err) => ({
              property: err.property,
              constraints: err.constraints,
            })),
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );

  app.enableCors();
  app.setGlobalPrefix('/v1');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('FX Backend API')
    .setDescription(
      'The Backend Service that will serve the FX Trading application',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const { httpAdapter } = app.get(HttpAdapterHost);

  httpAdapter.getInstance().get('/api/docs-json', (req, res) => {
    res.json(document);
  });

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(port);

  Logger.info(
    `🚀 Server running on http://localhost:${port}`,
    'ApplicationStarted',
  );
  Logger.info(
    `🚀 Swagger docs available on http://localhost:${port}/api/docs`,
    'ApplicationStarted',
  );
}

bootstrap();
