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
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { Policy as PolicyRow } from '@prisma/client';
import type { Policy } from '@frozen-fruit-shop/types';
import { Auth, Permission } from '../auth/auth.guard.js';
import { sanitizeRichText, toRichTextOutput } from '../common/rich-text.js';
import { slugify } from '../common/utils.js';
import { IsSlug, Trim } from '../common/validators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';

export class CreatePolicyDto {
  @Trim()
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập tiêu đề' })
  @MaxLength(150)
  title!: string;

  @IsOptional()
  @Trim()
  @IsSlug()
  slug?: string;

  /** HTML từ trình soạn thảo — được lọc lại trước khi lưu. */
  @IsOptional()
  @IsString()
  @MaxLength(300_000)
  content?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {}

function toPolicy(row: PolicyRow): Policy {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: toRichTextOutput(row.content),
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

const orderBy = [{ sortOrder: 'asc' as const }, { title: 'asc' as const }];

@Injectable()
export class PoliciesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  async list(onlyActive: boolean): Promise<Policy[]> {
    const rows = await this.prisma.policy.findMany({ where: onlyActive ? { isActive: true } : undefined, orderBy });
    return rows.map(toPolicy);
  }

  async findPublicBySlug(slug: string): Promise<Policy> {
    const row = await this.prisma.policy.findFirst({ where: { slug, isActive: true } });
    if (!row) throw new NotFoundException('Không tìm thấy trang chính sách.');
    return toPolicy(row);
  }

  async findById(id: string): Promise<Policy> {
    const row = await this.prisma.policy.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Không tìm thấy trang chính sách.');
    return toPolicy(row);
  }

  async create(dto: CreatePolicyDto): Promise<Policy> {
    const row = await this.prisma.policy.create({
      data: {
        title: dto.title,
        slug: dto.slug || slugify(dto.title),
        content: sanitizeRichText(dto.content),
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
    this.revalidate.notify('content');
    return toPolicy(row);
  }

  async update(id: string, dto: UpdatePolicyDto): Promise<Policy> {
    await this.findById(id);
    const row = await this.prisma.policy.update({ where: { id }, data: {
        ...dto,
        slug: dto.slug || undefined,
        content: dto.content === undefined ? undefined : sanitizeRichText(dto.content),
      },
    });
    this.revalidate.notify('content');
    return toPolicy(row);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.policy.delete({ where: { id } });
    this.revalidate.notify('content');
  }
}

@Controller('policies')
export class PublicPoliciesController {
  constructor(private readonly service: PoliciesService) {}

  @Get()
  list() {
    return this.service.list(true);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.findPublicBySlug(slug);
  }
}

@Controller('admin/policies')
@Auth()
@Permission('policies')
export class AdminPoliciesController {
  constructor(private readonly service: PoliciesService) {}

  @Get()
  list() {
    return this.service.list(false);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePolicyDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePolicyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}
