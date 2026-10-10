import { Body, Controller, Get, Injectable, Put } from '@nestjs/common';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Prisma } from '@prisma/client';
import {
  DEFAULT_PRODUCT_ASSURANCES,
  DEFAULT_SITE_SETTINGS,
  MAX_PRODUCT_ASSURANCES,
  type ProductAssurance,
  type SiteSettings,
} from '@frozen-fruit-shop/types';
import { Auth } from '../auth/auth.guard.js';
import { Trim } from '../common/validators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';

const URL_OR_EMPTY = /^(https?:\/\/\S+)?$/;
/** Link của thẻ cam kết: trang trong web, URL http(s), tel: hoặc mailto: — chặn "javascript:" v.v. */
const ASSURANCE_LINK = /^((\/|https?:\/\/|tel:|mailto:)\S*)?$/;

export class ProductAssuranceDto implements ProductAssurance {
  @Trim() @IsString() @MaxLength(8) icon!: string;
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
  @IsOptional() @IsString() @MaxLength(2000) bankTransferInfo!: string;
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
    return { ...settings, productAssurances: (productAssurances as ProductAssurance[] | null) ?? DEFAULT_PRODUCT_ASSURANCES };
  }

  async update(dto: UpdateSettingsDto): Promise<SiteSettings> {
    const data = {
      ...dto,
      marqueeEnabled: dto.marqueeEnabled ?? true,
      marqueeText: dto.marqueeText ?? '',
      bankTransferInfo: dto.bankTransferInfo ?? '',
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
  update(@Body() dto: UpdateSettingsDto) {
    return this.service.update(dto);
  }
}
