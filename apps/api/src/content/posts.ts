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
  Post as HttpPost,
  Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import type { Post as PostRow } from '@prisma/client';
import { POST_TYPES, type Post, type PostType } from '@frozen-fruit-shop/types';
import { Auth, Permission } from '../auth/auth.guard.js';
import { sanitizeRichText, toRichTextOutput } from '../common/rich-text.js';
import { iso, slugify, toPublicUrl, toStoredPath } from '../common/utils.js';
import { IsImagePath, IsSlug, Trim } from '../common/validators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';

export class CreatePostDto {
  @Trim()
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập tiêu đề' })
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @Trim()
  @IsSlug()
  slug?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  /** HTML từ trình soạn thảo — được lọc lại trước khi lưu (sanitizeRichText). */
  @IsOptional()
  @IsString()
  @MaxLength(300_000)
  content?: string;

  @IsOptional()
  @IsImagePath()
  coverImage?: string | null;

  @IsOptional()
  @IsIn(POST_TYPES, { message: 'Loại bài viết không hợp lệ' })
  type?: PostType;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày đăng không hợp lệ' })
  publishedAt?: string;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class PublicPostQuery {
  @IsOptional()
  @IsIn(POST_TYPES, { message: 'Loại bài viết không hợp lệ' })
  type?: PostType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: toRichTextOutput(row.content),
    coverImage: toPublicUrl(row.coverImage),
    type: row.type,
    isPublished: row.isPublished,
    publishedAt: iso(row.publishedAt),
  };
}

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  /** Bài đã bật hiển thị và đã tới ngày đăng (hẹn giờ đăng bằng cách đặt ngày trong tương lai). */
  async listPublic(limit?: number, type?: PostType): Promise<Post[]> {
    const rows = await this.prisma.post.findMany({
      where: { type, isPublished: true, publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    return rows.map(toPost);
  }

  async findPublicBySlug(slug: string): Promise<Post> {
    const row = await this.prisma.post.findFirst({
      where: { slug, isPublished: true, publishedAt: { lte: new Date() } },
    });
    if (!row) throw new NotFoundException('Không tìm thấy bài viết.');
    return toPost(row);
  }

  async listAll(): Promise<Post[]> {
    const rows = await this.prisma.post.findMany({ orderBy: { publishedAt: 'desc' } });
    return rows.map(toPost);
  }

  async findById(id: string): Promise<Post> {
    const row = await this.prisma.post.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Không tìm thấy bài viết.');
    return toPost(row);
  }

  async create(dto: CreatePostDto): Promise<Post> {
    const row = await this.prisma.post.create({
      data: {
        title: dto.title,
        slug: dto.slug || slugify(dto.title),
        excerpt: dto.excerpt ?? '',
        content: sanitizeRichText(dto.content),
        coverImage: toStoredPath(dto.coverImage),
        type: dto.type ?? 'knowledge',
        isPublished: dto.isPublished ?? true,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
      },
    });
    this.revalidate.notify('content');
    return toPost(row);
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    await this.findById(id);
    const row = await this.prisma.post.update({
      where: { id },
      data: {
        ...dto,
        content: dto.content === undefined ? undefined : sanitizeRichText(dto.content),
        slug: dto.slug || undefined,
        coverImage: dto.coverImage === undefined ? undefined : toStoredPath(dto.coverImage),
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      },
    });
    this.revalidate.notify('content');
    return toPost(row);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.post.delete({ where: { id } });
    this.revalidate.notify('content');
  }
}

@Controller('posts')
export class PublicPostsController {
  constructor(private readonly service: PostsService) {}

  @Get()
  list(@Query() query: PublicPostQuery) {
    return this.service.listPublic(query.limit, query.type);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.findPublicBySlug(slug);
  }
}

@Controller('admin/posts')
@Auth()
@Permission('posts')
export class AdminPostsController {
  constructor(private readonly service: PostsService) {}

  @Get()
  list() {
    return this.service.listAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @HttpPost()
  create(@Body() dto: CreatePostDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}
