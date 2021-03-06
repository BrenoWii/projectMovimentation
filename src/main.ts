import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger' ;
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
  })
  app.useGlobalPipes(new ValidationPipe());


  const options = new DocumentBuilder()
  .setTitle('Movimentation')
  .setDescription('the Finance APi')
  .setVersion('1.0')
  .addTag('movimentation')
  .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api',app, document)
  await app.listen(3000);
}
bootstrap();
