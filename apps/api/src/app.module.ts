import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProductsModule } from './products/products.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { BlogPostsModule } from './blog-posts/blog-posts.module.js';

@Module({
  imports: [PrismaModule, AuthModule, ProductsModule, CategoriesModule, BlogPostsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
