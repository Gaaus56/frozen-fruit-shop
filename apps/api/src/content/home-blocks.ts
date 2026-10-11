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
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import type { HomeBlock as HomeBlockRow } from '@prisma/client';
import { HOME_BLOCK_POSITIONS, type HomeBlock, type HomeBlockPosition } from '@frozen-fruit-shop/types';
import { Auth } from '../auth/auth.guard.js';
import { sanitizeRichText, toRichTextOutput } from '../common/rich-text.js';
import { Trim } from '../common/validators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';

export class CreateHomeBlockDto {
  /** Không bắt buộc — khối không tiêu đề thì chỉ hiện nội dung. */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(150)
  title?: string;

  /** HTML từ trình soạn thảo — được lọc lại trước khi lưu. */
  @IsOptional()
  @IsString()
  @MaxLength(300_000)
  content?: string;

  @IsOptional()
  @IsBoolean()
  framed?: boolean;

  @IsOptional()
  @IsIn(HOME_BLOCK_POSITIONS, { message: 'Vị trí không hợp lệ' })
  position?: HomeBlockPosition;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateHomeBlockDto extends PartialType(CreateHomeBlockDto) {}

function toHomeBlock(row: HomeBlockRow): HomeBlock {
  return {
    id: row.id,
    title: row.title,
    content: toRichTextOutput(row.content),
    framed: row.framed,
    position: row.position,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

const orderBy = [{ position: 'asc' as const }, { sortOrder: 'asc' as const }, { createdAt: 'asc' as const }];

@Injectable()
export class HomeBlocksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  async list(onlyActive: boolean): Promise<HomeBlock[]> {
    const rows = await this.prisma.homeBlock.findMany({ where: onlyActive ? { isActive: true } : undefined, orderBy });
    return rows.map(toHomeBlock);
  }

  async findById(id: string): Promise<HomeBlock> {
    const row = await this.prisma.homeBlock.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Không tìm thấy khối nội dung.');
    return toHomeBlock(row);
  }

  async create(dto: CreateHomeBlockDto): Promise<HomeBlock> {
    const row = await this.prisma.homeBlock.create({
      data: {
        title: dto.title ?? '',
        content: sanitizeRichText(dto.content),
        framed: dto.framed ?? true,
        position: dto.position ?? 'after_hero',
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
    this.revalidate.notify('content');
    return toHomeBlock(row);
  }

  async update(id: string, dto: UpdateHomeBlockDto): Promise<HomeBlock> {
    await this.findById(id);
    const row = await this.prisma.homeBlock.update({
      where: { id },
      data: { ...dto, content: dto.content === undefined ? undefined : sanitizeRichText(dto.content) },
    });
    this.revalidate.notify('content');
    return toHomeBlock(row);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.homeBlock.delete({ where: { id } });
    this.revalidate.notify('content');
  }
}

@Controller('home-blocks')
export class PublicHomeBlocksController {
  constructor(private readonly service: HomeBlocksService) {}

  @Get()
  list() {
    return this.service.list(true);
  }
}

@Controller('admin/home-blocks')
@Auth()
export class AdminHomeBlocksController {
  constructor(private readonly service: HomeBlocksService) {}

  @Get()
  list() {
    return this.service.list(false);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateHomeBlockDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHomeBlockDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}
