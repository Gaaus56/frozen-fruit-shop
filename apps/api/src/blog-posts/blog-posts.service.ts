import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateBlogPostDto } from './dto/blog-post.dto.js';
import type { UpdateBlogPostDto } from './dto/update-blog-post.dto.js';

@Injectable()
export class BlogPostsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.blogPost.findMany({ orderBy: { publishedAt: 'desc' } });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết với slug "${slug}"`);
    }
    return post;
  }

  create(dto: CreateBlogPostDto) {
    return this.prisma.blogPost.create({
      data: { ...dto, publishedAt: new Date(dto.publishedAt) },
    });
  }

  async update(slug: string, dto: UpdateBlogPostDto) {
    await this.findBySlug(slug);
    return this.prisma.blogPost.update({
      where: { slug },
      data: { ...dto, publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined },
    });
  }

  async remove(slug: string) {
    await this.findBySlug(slug);
    await this.prisma.blogPost.delete({ where: { slug } });
  }
}
