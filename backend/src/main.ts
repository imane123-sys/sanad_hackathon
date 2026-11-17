import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');

  // CORS Configuration
  app.enableCors({
    origin: corsOrigin.includes(',') ? corsOrigin.split(',') : corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe (class-validator & class-transformer)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SANAD API')
    .setDescription(
      'SANAD Platform REST API — Documentation for authentication, assistance, and AI services',
    )
    .setVersion('1.0.0')
    .addTag('System', 'System and health probe endpoints')
    .addTag('AI / LLM', 'Provider-independent AI assistance endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`SANAD Backend is running on: http://localhost:${port}/api/v1`);
  logger.log(`Swagger OpenAPI Documentation: http://localhost:${port}/api/docs`);
  logger.log(`Allowed CORS Origin: ${corsOrigin}`);
}

bootstrap();
