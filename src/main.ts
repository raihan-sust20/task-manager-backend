import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { RootModule } from './root.module';

/* Bootstrap the backend by instantiating the RootModule and binding it to port
 * 3000.
 */
async function bootstrap() {
  const app = await NestFactory.create(RootModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    // origin: R.split(' ', process.env.CORS_ORIGIN) || 'http://localhost:3000',
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    // preflightContinue: true,
  });
  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`App is running on port ${port}`);
}
bootstrap();
