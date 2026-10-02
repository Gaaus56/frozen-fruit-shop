import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { Prisma } from '@prisma/client';
import type { Category } from '@frozen-fruit-shop/types';
import { Auth } from '../auth/auth.guard.js';
import { slugify, toPublicUrl, toStoredPath } from '../common/utils.js';
import { IsImagePath, IsSlug, Trim } from '../common/validators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';

export class CreateCategoryDto {
  @Trim()
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập tên danh mục' })
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @Trim()
  @IsSlug()
  slug?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsImagePath()
  image?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

type CategoryRow = Prisma.CategoryGetPayload<{ include: { _count: { select: { products: true } } } }>;

function toCategory(row: CategoryRow, publicCount?: number): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: toPublicUrl(row.image),
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    productCount: publicCount ?? row._count.products,
  };
}

const orderBy: Prisma.CategoryOrderByWithRelationInput[] = [{ sortOrder: 'asc' }, { name: 'asc' }];

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  /** Danh mục đang hiển thị, kèm số sản phẩm đang bán trong mỗi danh mục. */
  async listPublic(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy,
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    return rows.map((row) => toCategory(row));
  }

  async listAll(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({
      orderBy,
      include: { _count: { select: { products: true } } },
    });
    return rows.map((row) => toCategory(row));
  }

  async findById(id: string): Promise<Category> {
    const row = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!row) throw new NotFoundException('Không tìm thấy danh mục.');
    return toCategory(row);
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const row = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug || slugify(dto.name),
        description: dto.description ?? '',
        image: toStoredPath(dto.image),
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: { _count: { select: { products: true } } },
    });
    this.revalidate.notify('catalog');
    return toCategory(row);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findById(id);
    const row = await this.prisma.category.update({
      where: { id },
      data: {
        ...dto,
        slug: dto.slug === '' ? undefined : dto.slug,
        image: dto.image === undefined ? undefined : toStoredPath(dto.image),
      },
      include: { _count: { select: { products: true } } },
    });
    this.revalidate.notify('catalog');
    return toCategory(row);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);
    if (category.productCount > 0) {
      throw new ConflictException(
        `Danh mục còn ${category.productCount} sản phẩm. Hãy chuyển hoặc xoá sản phẩm trước, hoặc tắt hiển thị danh mục.`,
      );
    }
    await this.prisma.category.delete({ where: { id } });
    this.revalidate.notify('catalog');
  }
}

@Controller('categories')
export class PublicCategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  list() {
    return this.service.listPublic();
  }
}

@Controller('admin/categories')
@Auth()
export class AdminCategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  list() {
    return this.service.listAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}

@Module({
  controllers: [PublicCategoriesController, AdminCategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
