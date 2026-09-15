export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface ProductVariant {
  id: string;
  packageSize: string;
  price: number;
  pricePerKg: number;
  stockStatus: StockStatus;
  sku: string;
}

export interface StorageInfo {
  temperature: string;
  shelfLifeDays: number;
  thawInstructions: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  images: string[];
  shortDescription: string;
  description: string;
  storageInfo: StorageInfo;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  tags: string[];
  isWholesaleAvailable: boolean;
  relatedProductIds: string[];
}
