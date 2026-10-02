import { env } from './config/env.js';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'node:fs';
import { AppModule } from './app.module.js';
import { PrismaExceptionFilter } from './common/prisma-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: true });

  // Chạy sau reverse proxy (Caddy/Nginx): lấy đúng IP khách từ X-Forwarded-For để giới hạn tần suất.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.useBodyParser('json', { limit: '1mb' });

  app.use((_req: unknown, res: { setHeader(name: string, value: string): void }, next: () => void) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.enableCors({ origin: env.corsOrigins, methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] });

  // Ảnh tải lên: tên file ngẫu nhiên nên cache dài hạn được; không cho liệt kê thư mục.
  mkdirSync(env.uploadDir, { recursive: true });
  app.useStaticAssets(env.uploadDir, {
    prefix: '/uploads/',
    index: false,
    dotfiles: 'deny',
    maxAge: '365d',
    immutable: true,
  });

  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.enableShutdownHooks();

  await app.listen(env.port);
  Logger.log(`API đang chạy tại ${env.publicUrl}`, 'Bootstrap');
}

await bootstrap();
