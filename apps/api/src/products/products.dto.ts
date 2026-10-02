import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IsImagePath, IsSlug, Trim } from '../common/validators.js';

const STOCK_STATUSES = ['in_stock', 'low_stock', 'out_of_stock'] as const;

export class ProductImageInput {
  @IsImagePath()
  url!: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(200)
  alt?: string;
}

export class ProductVariantInput {
  /** Có id = sửa quy cách đang có; không có id = thêm mới. Quy cách không gửi lên sẽ bị xoá. */
  @IsOptional()
  @IsString()
  id?: string;

  @Trim()
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập tên quy cách (ví dụ 500g)' })
  @MaxLength(60)
  packageSize!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  weightGrams?: number | null;

  @IsInt({ message: 'Giá phải là số nguyên (đồng)' })
  @Min(0)
  @Max(1_000_000_000)
  price!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  compareAtPrice?: number | null;

  @IsIn(STOCK_STATUSES)
  stockStatus!: (typeof STOCK_STATUSES)[number];

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(60)
  sku?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateProductDto {
  @Trim()
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập tên sản phẩm' })
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @Trim()
  @IsSlug()
  slug?: string;

  @IsString()
  @MinLength(1, { message: 'Vui lòng chọn danh mục' })
  categoryId!: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  description?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(200)
  storageTemperature?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  shelfLifeDays?: number | null;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(1000)
  thawInstructions?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isWholesaleAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsArray()
  @ArrayMaxSize(12, { message: 'Tối đa 12 ảnh cho một sản phẩm' })
  @ValidateNested({ each: true })
  @Type(() => ProductImageInput)
  images!: ProductImageInput[];

  @IsArray()
  @ArrayMinSize(1, { message: 'Cần ít nhất một quy cách đóng gói' })
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantInput)
  variants!: ProductVariantInput[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class PublicProductQuery {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  featured?: 'true' | 'false';

  @IsOptional()
  @IsIn(['true', 'false'])
  wholesale?: 'true' | 'false';

  @IsOptional()
  @IsIn(['default', 'newest', 'price_asc', 'price_desc'])
  sort?: 'default' | 'newest' | 'price_asc' | 'price_desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class AdminProductQuery {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'all'])
  status?: 'active' | 'inactive' | 'all';
}
