import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger' ;
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  
  // Global exception filter for detailed error logging
  app.useGlobalFilters(new AllExceptionsFilter());
  
  app.enableCors({
    origin: ['http://localhost:8080', 'http://100.113.154.3:8080'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  })
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false, // Allow extra properties for flexibility
  }));

  const options = new DocumentBuilder()
  .setTitle('Movimentation')
  .setDescription('the Finance APi')
  .setVersion('1.0')
  .addTag('movimentation')
  .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api',app, document)
  
  const logger = new Logger('Bootstrap');
  await app.listen(3000);
  logger.log('🚀 Application is running on: http://localhost:3000');
  logger.log('📚 Swagger documentation: http://localhost:3000/api');
}
bootstrap();
