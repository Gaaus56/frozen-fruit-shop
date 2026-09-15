import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { StorageInfoDto } from './storage-info.dto.js';
import { ProductVariantDto } from './product-variant.dto.js';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  slug!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  categorySlug!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  images!: string[];

  @IsString()
  @MinLength(1)
  shortDescription!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @ValidateNested()
  @Type(() => StorageInfoDto)
  storageInfo!: StorageInfoDto;

  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];

  @IsBoolean()
  isWholesaleAvailable = false;

  @IsArray()
  @IsString({ each: true })
  relatedProductIds: string[] = [];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants!: ProductVariantDto[];
}
