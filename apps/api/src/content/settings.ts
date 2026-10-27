import { Body, Controller, Get, Injectable, Put } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Prisma } from '@prisma/client';
import {
  DEFAULT_PRODUCT_ASSURANCES,
  DEFAULT_SITE_SETTINGS,
  ASSURANCE_ICONS,
  MAX_PRODUCT_ASSURANCES,
  normalizeAssuranceIcon,
  type ProductAssurance,
  type SiteSettings,
} from '@frozen-fruit-shop/types';
import { Auth, RequireOtp } from '../auth/auth.guard.js';
import { Trim } from '../common/validators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';

const URL_OR_EMPTY = /^(https?:\/\/\S+)?$/;
/** Link của thẻ cam kết: trang trong web, URL http(s), tel: hoặc mailto: — chặn "javascript:" v.v. */
const ASSURANCE_LINK = /^((\/|https?:\/\/|tel:|mailto:)\S*)?$/;

export class ProductAssuranceDto implements ProductAssurance {
  // Tên icon nét (snowflake, truck…); emoji kiểu cũ (❄️, 🚚…) được đổi sang tên icon tương ứng.
  @Transform(({ value }) => (typeof value === 'string' ? normalizeAssuranceIcon(value) : value))
  @IsIn(ASSURANCE_ICONS)
  icon!: string;
  @Trim() @IsString() @MaxLength(60) title!: string;
  @Trim() @IsString() @MaxLength(160) text!: string;
  @Trim() @Matches(ASSURANCE_LINK, { message: 'Link thẻ cam kết không hợp lệ' }) @MaxLength(500) linkUrl!: string;
}

export class UpdateSettingsDto implements SiteSettings {
  @Trim() @IsString() @MinLength(1, { message: 'Vui lòng nhập tên cửa hàng' }) @MaxLength(120) storeName!: string;
  @Trim() @IsString() @MinLength(1, { message: 'Vui lòng nhập tên rút gọn' }) @MaxLength(60) shortName!: string;
  @Trim() @Matches(/^[\d\s.+]{8,15}$/, { message: 'Số điện thoại không hợp lệ' }) phone!: string;
  @Trim() @IsString() @MaxLength(40) hotlineHours!: string;
  @Trim() @IsString() @MaxLength(120) email!: string;
  @Trim() @IsString() @MaxLength(200) address!: string;
  @Trim() @IsString() @MaxLength(120) addressLandmark!: string;
  @Trim() @Matches(URL_OR_EMPTY, { message: 'Link bản đồ phải là URL http(s)' }) mapUrl!: string;
  @Trim() @Matches(URL_OR_EMPTY, { message: 'Link Facebook phải là URL http(s)' }) facebookUrl!: string;
  @Trim() @Matches(/^[\d\s.+]{0,15}$/, { message: 'Số Zalo không hợp lệ' }) zaloPhone!: string;
  @Trim() @IsString() @MaxLength(30) taxCode!: string;
  @Trim() @IsString() @MaxLength(100) taxNote!: string;
  @IsOptional() @IsBoolean() marqueeEnabled!: boolean;
  @IsOptional() @Trim() @IsString() @MaxLength(500) marqueeText!: string;
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_PRODUCT_ASSURANCES)
  @ValidateNested({ each: true })
  @Type(() => ProductAssuranceDto)
  productAssurances!: ProductAssurance[];
}

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  async get(): Promise<SiteSettings> {
    const row = await this.prisma.siteSetting.findUnique({ where: { id: 1 } });
    if (!row) return DEFAULT_SITE_SETTINGS;
    const { id: _id, updatedAt: _updatedAt, productAssurances, ...settings } = row;
    // null = admin chưa chỉnh thẻ cam kết lần nào → dùng bộ mặc định.
    const assurances = (productAssurances as ProductAssurance[] | null) ?? DEFAULT_PRODUCT_ASSURANCES;
    // Dữ liệu lưu từ trước khi đổi sang icon nét còn là emoji → trả tên icon tương ứng.
    return { ...settings, productAssurances: assurances.map((item) => ({ ...item, icon: normalizeAssuranceIcon(item.icon) })) };
  }

  async update(dto: UpdateSettingsDto): Promise<SiteSettings> {
    const data = {
      ...dto,
      marqueeEnabled: dto.marqueeEnabled ?? true,
      marqueeText: dto.marqueeText ?? '',
      // Ô để trống tiêu đề = bỏ thẻ đó. Không gửi trường này thì giữ nguyên giá trị cũ.
      productAssurances: dto.productAssurances
        ? (dto.productAssurances.filter((item) => item.title) as unknown as Prisma.InputJsonValue)
        : undefined,
    };
    await this.prisma.siteSetting.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
    this.revalidate.notify('settings');
    return this.get();
  }
}

@Controller('settings')
export class PublicSettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  get() {
    return this.service.get();
  }
}

@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  @Auth()
  get() {
    return this.service.get();
  }

  @Put()
  @Auth('ADMIN')
  // Đổi hotline / số Zalo / Facebook là cách kẻ gian dễ lừa khách nhất → cần nhập lại mã OTP.
  @RequireOtp()
  update(@Body() dto: UpdateSettingsDto) {
    return this.service.update(dto);
  }
}
