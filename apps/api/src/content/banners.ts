import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import type { Banner as BannerRow } from '@prisma/client';
import { BANNER_PLACEMENTS, type Banner, type BannerPlacement } from '@frozen-fruit-shop/types';
import { Auth, Permission } from '../auth/auth.guard.js';
import { toPublicUrl, toStoredPath } from '../common/utils.js';
import { IsImagePath, Trim } from '../common/validators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';

export class CreateBannerDto {
  @IsImagePath()
  image!: string;

  @IsOptional()
  @IsIn(BANNER_PLACEMENTS, { message: 'Vị trí banner không hợp lệ' })
  placement?: BannerPlacement;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(300)
  description?: string;

  /** Đường dẫn trong web ("/products") hoặc URL đầy đủ. */
  @IsOptional()
  @Trim()
  @Matches(/^(\/\S*|https?:\/\/\S+)?$/, { message: 'Liên kết phải bắt đầu bằng "/" hoặc http(s)://' })
  linkUrl?: string | null;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(40)
  ctaLabel?: string | null;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}

export class BannerQuery {
  @IsOptional()
  @IsIn(BANNER_PLACEMENTS, { message: 'Vị trí banner không hợp lệ' })
  placement?: BannerPlacement;
}

function toBanner(row: BannerRow): Banner {
  return {
    id: row.id,
    placement: row.placement,
    title: row.title,
    description: row.description,
    image: toPublicUrl(row.image),
    linkUrl: row.linkUrl,
    ctaLabel: row.ctaLabel,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

const orderBy = [{ placement: 'asc' as const }, { sortOrder: 'asc' as const }, { createdAt: 'asc' as const }];

@Injectable()
export class BannersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  async list(onlyActive: boolean, placement?: BannerPlacement): Promise<Banner[]> {
    const rows = await this.prisma.banner.findMany({
      where: { placement, isActive: onlyActive ? true : undefined },
      orderBy,
    });
    return rows.map(toBanner);
  }

  async findById(id: string): Promise<Banner> {
    const row = await this.prisma.banner.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Không tìm thấy banner.');
    return toBanner(row);
  }

  async create(dto: CreateBannerDto): Promise<Banner> {
    const row = await this.prisma.banner.create({
      data: {
        image: toStoredPath(dto.image),
        placement: dto.placement ?? 'home',
        title: dto.title ?? '',
        description: dto.description ?? '',
        linkUrl: dto.linkUrl || null,
        ctaLabel: dto.ctaLabel || null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
    this.revalidate.notify('content');
    return toBanner(row);
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    await this.findById(id);
    const row = await this.prisma.banner.update({
      where: { id },
      data: {
        ...dto,
        image: dto.image ? toStoredPath(dto.image) : undefined,
        linkUrl: dto.linkUrl === undefined ? undefined : dto.linkUrl || null,
        ctaLabel: dto.ctaLabel === undefined ? undefined : dto.ctaLabel || null,
      },
    });
    this.revalidate.notify('content');
    return toBanner(row);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.banner.delete({ where: { id } });
    this.revalidate.notify('content');
  }
}

@Controller('banners')
export class PublicBannersController {
  constructor(private readonly service: BannersService) {}

  /** Mặc định trả banner trang chủ (giữ tương thích với web cũ); `?placement=products` cho trang Sản phẩm. */
  @Get()
  list(@Query() query: BannerQuery) {
    return this.service.list(true, query.placement ?? 'home');
  }
}

@Controller('admin/banners')
@Auth()
@Permission('banners')
export class AdminBannersController {
  constructor(private readonly service: BannersService) {}

  @Get()
  list(@Query() query: BannerQuery) {
    return this.service.list(false, query.placement);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateBannerDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}
