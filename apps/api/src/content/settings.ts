import { Body, Controller, Get, Injectable, Put } from '@nestjs/common';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@frozen-fruit-shop/types';
import { Auth } from '../auth/auth.guard.js';
import { Trim } from '../common/validators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';

const URL_OR_EMPTY = /^(https?:\/\/\S+)?$/;

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
  @IsOptional() @Trim() @IsString() @MaxLength(500) marqueeText!: string;
  @IsOptional() @IsString() @MaxLength(2000) bankTransferInfo!: string;
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
    const { id: _id, updatedAt: _updatedAt, ...settings } = row;
    return settings;
  }

  async update(dto: UpdateSettingsDto): Promise<SiteSettings> {
    const data = { ...dto, marqueeText: dto.marqueeText ?? '', bankTransferInfo: dto.bankTransferInfo ?? '' };
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
