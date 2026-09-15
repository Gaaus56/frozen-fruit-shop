import type { Product as ProductDto } from '@frozen-fruit-shop/types';
import { Prisma } from '@prisma/client';

const productWithRelations = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { category: true, variants: true },
});

export type ProductWithRelations = Prisma.ProductGetPayload<typeof productWithRelations>;

export function toProductDto(product: ProductWithRelations): ProductDto {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categorySlug: product.category.slug,
    images: product.images,
    shortDescription: product.shortDescription,
    description: product.description,
    storageInfo: {
      temperature: product.storageTemperature,
      shelfLifeDays: product.shelfLifeDays,
      thawInstructions: product.thawInstructions,
    },
    rating: product.rating,
    reviewCount: product.reviewCount,
    tags: product.tags,
    isWholesaleAvailable: product.isWholesaleAvailable,
    relatedProductIds: product.relatedProductIds,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      packageSize: variant.packageSize,
      price: variant.price,
      pricePerKg: variant.pricePerKg,
      stockStatus: variant.stockStatus,
      sku: variant.sku,
    })),
  };
}
