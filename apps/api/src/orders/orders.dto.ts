import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../common/pagination.js';
import { Trim } from '../common/validators.js';

export const ORDER_STATUSES = ['pending', 'confirmed', 'packing', 'shipping', 'delivered', 'cancelled'] as const;
/** Chỉ nhận COD (đã bỏ chuyển khoản). */
export const PAYMENT_METHODS = ['cod'] as const;
export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;

/** Số di động/cố định Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx, cho phép dấu cách/chấm. */
export const VN_PHONE = /^(\+84|0)[\s.]*\d([\s.]*\d){8,9}$/;

export class CartLineDto {
  @IsString()
  @MinLength(1)
  variantId!: string;

  @IsInt()
  @Min(1)
  @Max(999)
  quantity!: number;
}

export class QuoteDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Giỏ hàng đang trống' })
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CartLineDto)
  items!: CartLineDto[];
}

export class CreateOrderDto extends QuoteDto {
  @Trim()
  @IsString()
  @MinLength(2, { message: 'Vui lòng nhập họ tên người nhận' })
  @MaxLength(100)
  customerName!: string;

  @Trim()
  @Matches(VN_PHONE, { message: 'Số điện thoại không hợp lệ' })
  customerPhone!: string;

  @IsOptional()
  @Trim()
  @ValidateIf((_, value) => value !== '')
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(120)
  customerEmail?: string;

  @Trim()
  @IsString()
  @MinLength(10, { message: 'Vui lòng nhập địa chỉ giao hàng đầy đủ' })
  @MaxLength(300)
  shippingAddress!: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(1000)
  customerNote?: string;

  /** Không bắt buộc (mặc định COD); trình duyệt còn bản web cũ có thể vẫn gửi lên. */
  @IsOptional()
  @IsIn(PAYMENT_METHODS, { message: 'Cửa hàng chỉ nhận thanh toán khi nhận hàng (COD).' })
  paymentMethod?: (typeof PAYMENT_METHODS)[number];

  /** Ô ẩn chống bot: người thật không nhìn thấy nên luôn để trống. */
  @IsOptional()
  @IsString()
  website?: string;
}

export class LookupOrderQuery {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @MinLength(4, { message: 'Vui lòng nhập mã đơn hàng' })
  @MaxLength(30)
  orderNumber!: string;

  @Trim()
  @Matches(VN_PHONE, { message: 'Số điện thoại không hợp lệ' })
  phone!: string;
}

export class AdminOrderQuery extends PaginationQueryDto {
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: (typeof ORDER_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: (typeof ORDER_STATUSES)[number];

  @IsOptional()
  @IsIn(PAYMENT_STATUSES)
  paymentStatus?: (typeof PAYMENT_STATUSES)[number];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  shippingFee?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  discount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNote?: string;

  /** Ghi chú kèm theo lần đổi trạng thái (lưu vào lịch sử đơn). */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(500)
  note?: string;
}
