import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { RootModule } from './root.module';
import { authServiceClientOptions } from './api/v1/user/auth/auth.constants';

const honeyCompEnvExist = process.env.HONEYCOMB_API_KEY && process.env.HONEYCOMB_DATASET;
const enableHoneyComp = honeyCompEnvExist && process.env.NODE_ENV === 'production';
if (enableHoneyComp) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('honeycomb-beeline')({
    writeKey: process.env.HONEYCOMB_API_KEY,
    dataset: process.env.HONEYCOMB_DATASET,
    serviceName: 'naas-backend'
  });
}

/* Bootstrap the backend by instantiating the RootModule and binding it to port
 * 3000.
 */
async function bootstrap() {
  const app = await NestFactory.create(RootModule);
  app.connectMicroservice<MicroserviceOptions>(authServiceClientOptions);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    // origin: R.split(' ', process.env.CORS_ORIGIN) || 'http://localhost:3000',
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    // preflightContinue: true,
  });
  app.use(cookieParser());
  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`App is running on port ${port}`);
}
bootstrap();
