import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateCategoryDto } from './dto/category.dto.js';
import type { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với slug "${slug}"`);
    }
    return category;
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async update(slug: string, dto: UpdateCategoryDto) {
    await this.findBySlug(slug);
    return this.prisma.category.update({ where: { slug }, data: dto });
  }

  async remove(slug: string) {
    await this.findBySlug(slug);
    await this.prisma.category.delete({ where: { slug } });
  }
}
