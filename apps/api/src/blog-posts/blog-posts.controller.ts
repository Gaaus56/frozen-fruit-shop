import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service.js';
import { CreateBlogPostDto } from './dto/blog-post.dto.js';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Get()
  findAll() {
    return this.blogPostsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blogPostsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogPostsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':slug')
  update(@Param('slug') slug: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogPostsService.update(slug, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug')
  @HttpCode(204)
  async remove(@Param('slug') slug: string) {
    await this.blogPostsService.remove(slug);
  }
}
