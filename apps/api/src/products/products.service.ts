import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { toProductDto } from './products.mapper.js';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { UpdateProductDto } from './dto/update-product.dto.js';

const include = { category: true, variants: true } as const;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(categorySlug?: string) {
    const products = await this.prisma.product.findMany({
      where: categorySlug ? { category: { slug: categorySlug } } : undefined,
      include,
      orderBy: { createdAt: 'asc' },
    });
    return products.map(toProductDto);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include,
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với slug "${slug}"`);
    }
    return toProductDto(product);
  }

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({ where: { slug: dto.categorySlug } });
    if (!category) {
      throw new BadRequestException(`Không tìm thấy danh mục với slug "${dto.categorySlug}"`);
    }

    const product = await this.prisma.product.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        categoryId: category.id,
        images: dto.images,
        shortDescription: dto.shortDescription,
        description: dto.description,
        storageTemperature: dto.storageInfo.temperature,
        shelfLifeDays: dto.storageInfo.shelfLifeDays,
        thawInstructions: dto.storageInfo.thawInstructions,
        tags: dto.tags,
        isWholesaleAvailable: dto.isWholesaleAvailable,
        relatedProductIds: dto.relatedProductIds,
        variants: { create: dto.variants },
      },
      include,
    });
    return toProductDto(product);
  }

  async update(slug: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với slug "${slug}"`);
    }

    let categoryId: string | undefined;
    if (dto.categorySlug) {
      const category = await this.prisma.category.findUnique({ where: { slug: dto.categorySlug } });
      if (!category) {
        throw new BadRequestException(`Không tìm thấy danh mục với slug "${dto.categorySlug}"`);
      }
      categoryId = category.id;
    }

    const product = await this.prisma.product.update({
      where: { slug },
      data: {
        slug: dto.slug,
        name: dto.name,
        categoryId,
        images: dto.images,
        shortDescription: dto.shortDescription,
        description: dto.description,
        storageTemperature: dto.storageInfo?.temperature,
        shelfLifeDays: dto.storageInfo?.shelfLifeDays,
        thawInstructions: dto.storageInfo?.thawInstructions,
        tags: dto.tags,
        isWholesaleAvailable: dto.isWholesaleAvailable,
        relatedProductIds: dto.relatedProductIds,
        ...(dto.variants
          ? { variants: { deleteMany: {}, create: dto.variants } }
          : {}),
      },
      include,
    });
    return toProductDto(product);
  }

  async remove(slug: string) {
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với slug "${slug}"`);
    }
    await this.prisma.product.delete({ where: { slug } });
  }
}
