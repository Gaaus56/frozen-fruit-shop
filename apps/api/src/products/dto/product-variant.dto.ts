import { IsIn, IsInt, IsPositive, IsString, MinLength } from 'class-validator';

const STOCK_STATUSES = ['in_stock', 'low_stock', 'out_of_stock'] as const;

export class ProductVariantDto {
  @IsString()
  @MinLength(1)
  packageSize!: string;

  @IsInt()
  @IsPositive()
  price!: number;

  @IsInt()
  @IsPositive()
  pricePerKg!: number;

  @IsIn(STOCK_STATUSES)
  stockStatus!: (typeof STOCK_STATUSES)[number];

  @IsString()
  @MinLength(1)
  sku!: string;
}
