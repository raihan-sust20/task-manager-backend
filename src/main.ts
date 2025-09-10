import { NestFactory } from '@nestjs/core';
import * as R from 'ramda';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { getEnvFilePath } from './api/v1/utils/environment';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const envFilePath = getEnvFilePath(process.env.NODE_ENV);
dotenv.config({ path: envFilePath });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('envFilePath:', envFilePath);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.enableCors({
    origin: R.split(',', process.env.CORS_ORIGIN) || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    // preflightContinue: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Your API Title') // Set the title of your API
    .setDescription('The API description') // Provide a description
    .setVersion('0.1.0') // Specify the API version
    .addBearerAuth()
    .addTag('Auth') // Add a tag for your API endpoints
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // 'api' is the endpoint for your docs

  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`App is running on port ${port}`);
}

bootstrap();
