import { Module } from '@nestjs/common';
import { BlogPostsController } from './blog-posts.controller.js';
import { BlogPostsService } from './blog-posts.service.js';

@Module({
  controllers: [BlogPostsController],
  providers: [BlogPostsService],
})
export class BlogPostsModule {}
