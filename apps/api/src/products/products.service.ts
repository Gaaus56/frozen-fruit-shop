import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { Product, ProductDetail } from '@frozen-fruit-shop/types';
import { iso, slugify, toPublicUrl, toStoredPath } from '../common/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';
import type {
  AdminProductQuery,
  CreateProductDto,
  ProductVariantInput,
  PublicProductQuery,
  UpdateProductDto,
} from './products.dto.js';

const include = {
  category: { select: { id: true, slug: true, name: true } },
  images: { orderBy: { sortOrder: 'asc' } },
  variants: { orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }] },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof include }>;

/** Điều kiện "đang bán" cho web khách: sản phẩm và danh mục đều đang bật, còn ít nhất 1 quy cách bật. */
const publicWhere: Prisma.ProductWhereInput = {
  isActive: true,
  category: { isActive: true },
  variants: { some: { isActive: true } },
};

function toProduct(row: ProductRow, onlyActiveVariants = false): Product {
  const variants = onlyActiveVariants ? row.variants.filter((variant) => variant.isActive) : row.variants;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    images: row.images.map((image) => ({ id: image.id, url: toPublicUrl(image.url), alt: image.alt || row.name })),
    shortDescription: row.shortDescription,
    description: row.description,
    storageInfo: {
      temperature: row.storageTemperature,
      shelfLifeDays: row.shelfLifeDays,
      thawInstructions: row.thawInstructions,
    },
    isFeatured: row.isFeatured,
    isWholesaleAvailable: row.isWholesaleAvailable,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    variants: variants.map((variant) => ({
      id: variant.id,
      packageSize: variant.packageSize,
      weightGrams: variant.weightGrams,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      pricePerKg: variant.weightGrams ? Math.round((variant.price * 1000) / variant.weightGrams) : null,
      stockStatus: variant.stockStatus,
      sku: variant.sku,
      sortOrder: variant.sortOrder,
      isActive: variant.isActive,
    })),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

function minPrice(product: Product): number {
  return Math.min(...product.variants.map((variant) => variant.price));
}

function searchWhere(q: string | undefined): Prisma.ProductWhereInput | undefined {
  const term = q?.trim();
  if (!term) return undefined;
  // Tìm theo tên (có dấu) hoặc theo slug (không dấu) để "xoai" vẫn ra "Xoài".
  return {
    OR: [
      { name: { contains: term, mode: 'insensitive' } },
      { slug: { contains: slugify(term) } },
    ],
  };
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  // ─────────── Web khách hàng ───────────

  async listPublic(query: PublicProductQuery): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: {
        AND: [
          publicWhere,
          query.category ? { category: { slug: query.category } } : {},
          query.featured === 'true' ? { isFeatured: true } : {},
          query.wholesale === 'true' ? { isWholesaleAvailable: true } : {},
          searchWhere(query.q) ?? {},
        ],
      },
      include,
      orderBy: query.sort === 'newest' ? [{ createdAt: 'desc' }] : [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    let products = rows.map((row) => toProduct(row, true));
    if (query.sort === 'price_asc') products.sort((a, b) => minPrice(a) - minPrice(b));
    if (query.sort === 'price_desc') products.sort((a, b) => minPrice(b) - minPrice(a));
    if (query.limit) products = products.slice(0, query.limit);
    return products;
  }

  async findPublicBySlug(slug: string): Promise<ProductDetail> {
    const row = await this.prisma.product.findFirst({ where: { ...publicWhere, slug }, include });
    if (!row) throw new NotFoundException('Không tìm thấy sản phẩm.');

    const related = await this.prisma.product.findMany({
      where: { ...publicWhere, categoryId: row.categoryId, id: { not: row.id } },
      include,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 4,
    });

    return { ...toProduct(row, true), relatedProducts: related.map((item) => toProduct(item, true)) };
  }

  // ─────────── Trang quản trị ───────────

  async listAdmin(query: AdminProductQuery): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: {
        AND: [
          query.categoryId ? { categoryId: query.categoryId } : {},
          query.status === 'active' ? { isActive: true } : query.status === 'inactive' ? { isActive: false } : {},
          searchWhere(query.q) ?? {},
        ],
      },
      include,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return rows.map((row) => toProduct(row));
  }

  async findById(id: string): Promise<Product> {
    const row = await this.prisma.product.findUnique({ where: { id }, include });
    if (!row) throw new NotFoundException('Không tìm thấy sản phẩm.');
    return toProduct(row);
  }

  async create(dto: CreateProductDto): Promise<Product> {
    await this.ensureCategory(dto.categoryId);
    this.ensureVariants(dto.variants);

    const row = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug || slugify(dto.name),
        categoryId: dto.categoryId,
        shortDescription: dto.shortDescription ?? '',
        description: dto.description ?? '',
        storageTemperature: dto.storageTemperature ?? '',
        shelfLifeDays: dto.shelfLifeDays ?? null,
        thawInstructions: dto.thawInstructions ?? '',
        isFeatured: dto.isFeatured ?? false,
        isWholesaleAvailable: dto.isWholesaleAvailable ?? false,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
        images: {
          create: dto.images.map((image, index) => ({
            url: toStoredPath(image.url),
            alt: image.alt ?? '',
            sortOrder: index,
          })),
        },
        variants: { create: dto.variants.map((variant, index) => this.variantData(variant, index)) },
      },
      include,
    });
    this.revalidate.notify('catalog');
    return toProduct(row);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.prisma.product.findUnique({ where: { id }, include: { variants: true } });
    if (!existing) throw new NotFoundException('Không tìm thấy sản phẩm.');
    if (dto.categoryId) await this.ensureCategory(dto.categoryId);
    if (dto.variants) this.ensureVariants(dto.variants);

    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: dto.name,
          slug: dto.slug || undefined,
          categoryId: dto.categoryId,
          shortDescription: dto.shortDescription,
          description: dto.description,
          storageTemperature: dto.storageTemperature,
          shelfLifeDays: dto.shelfLifeDays,
          thawInstructions: dto.thawInstructions,
          isFeatured: dto.isFeatured,
          isWholesaleAvailable: dto.isWholesaleAvailable,
          isActive: dto.isActive,
          sortOrder: dto.sortOrder,
        },
      });

      if (dto.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: dto.images.map((image, index) => ({
            productId: id,
            url: toStoredPath(image.url),
            alt: image.alt ?? '',
            sortOrder: index,
          })),
        });
      }

      if (dto.variants) {
        // Cập nhật theo id thay vì xoá hết rồi tạo lại, để đơn hàng cũ vẫn trỏ đúng quy cách.
        const existingIds = new Set(existing.variants.map((variant) => variant.id));
        const keepIds = new Set(dto.variants.flatMap((variant) => (variant.id ? [variant.id] : [])));
        for (const variantId of keepIds) {
          if (!existingIds.has(variantId)) throw new BadRequestException('Quy cách không thuộc sản phẩm này.');
        }

        await tx.productVariant.deleteMany({ where: { productId: id, id: { notIn: [...keepIds] } } });
        for (const [index, variant] of dto.variants.entries()) {
          const data = this.variantData(variant, index);
          if (variant.id) {
            await tx.productVariant.update({ where: { id: variant.id }, data });
          } else {
            await tx.productVariant.create({ data: { ...data, productId: id } });
          }
        }
      }
    });

    this.revalidate.notify('catalog');
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    // Đơn hàng cũ giữ nguyên tên/giá đã lưu; liên kết tới sản phẩm tự chuyển thành null.
    await this.prisma.product.delete({ where: { id } });
    this.revalidate.notify('catalog');
  }

  private variantData(variant: ProductVariantInput, index: number) {
    return {
      packageSize: variant.packageSize,
      weightGrams: variant.weightGrams ?? null,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice && variant.compareAtPrice > variant.price ? variant.compareAtPrice : null,
      stockStatus: variant.stockStatus,
      sku: variant.sku || null,
      isActive: variant.isActive ?? true,
      sortOrder: index,
    };
  }

  private ensureVariants(variants: ProductVariantInput[]) {
    const labels = variants.map((variant) => variant.packageSize.toLowerCase());
    if (new Set(labels).size !== labels.length) {
      throw new BadRequestException('Các quy cách đóng gói không được trùng tên.');
    }
  }

  private async ensureCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new BadRequestException('Danh mục không tồn tại.');
  }
}
