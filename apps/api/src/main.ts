import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    process.env.WEB_APP_URL ?? 'http://localhost:3000',
    process.env.ADMIN_APP_URL ?? 'http://localhost:3002',
  ];
  app.enableCors({ origin: allowedOrigins });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();
