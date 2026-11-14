import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { Comment as CommentRow, Post as PostRow, Prisma } from '@prisma/client';
import {
  COMMENT_STATUSES,
  type Comment,
  type CommentStatus,
  type Paginated,
  type PublicComment,
} from '@frozen-fruit-shop/types';
import { Auth, Permission } from '../auth/auth.guard.js';
import { PaginationQueryDto, paginate } from '../common/pagination.js';
import { RateLimit } from '../common/rate-limit.guard.js';
import { iso } from '../common/utils.js';
import { Trim } from '../common/validators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RealtimeService } from '../realtime/realtime.module.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';

export class CreateCommentDto {
  @Trim()
  @IsString()
  @MinLength(2, { message: 'Vui lòng nhập tên (ít nhất 2 ký tự)' })
  @MaxLength(80, { message: 'Tên tối đa 80 ký tự' })
  name!: string;

  @Trim()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(120, { message: 'Email tối đa 120 ký tự' })
  email!: string;

  @Trim()
  @IsString()
  @MinLength(2, { message: 'Vui lòng nhập nội dung bình luận' })
  @MaxLength(2000, { message: 'Bình luận tối đa 2000 ký tự' })
  content!: string;

  /** Ô ẩn chống bot: người thật không thấy nên luôn để trống. */
  @IsOptional()
  @IsString()
  website?: string;
}

export class CommentQuery extends PaginationQueryDto {
  @IsOptional()
  @IsIn(COMMENT_STATUSES, { message: 'Trạng thái không hợp lệ' })
  status?: CommentStatus;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsIn(COMMENT_STATUSES, { message: 'Trạng thái không hợp lệ' })
  status?: CommentStatus;

  /** Trả lời của cửa hàng; chuỗi rỗng = xoá câu trả lời. */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2000, { message: 'Trả lời tối đa 2000 ký tự' })
  reply?: string;
}

function toPublic(row: CommentRow): PublicComment {
  return {
    id: row.id,
    name: row.name,
    content: row.content,
    reply: row.reply,
    createdAt: iso(row.createdAt),
    repliedAt: iso(row.repliedAt),
  };
}

function toComment(row: CommentRow & { post: Pick<PostRow, 'id' | 'slug' | 'title'> }): Comment {
  return { ...toPublic(row), email: row.email, status: row.status, post: row.post };
}

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly revalidate: RevalidateService,
  ) {}

  /** Bài đang hiện trên web (đã bật, đã tới ngày đăng) — chỉ bài như vậy mới xem / gửi bình luận được. */
  private async findPublicPost(slug: string) {
    const post = await this.prisma.post.findFirst({ where: { slug, isPublished: true, publishedAt: { lte: new Date() } } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết.');
    return post;
  }

  async listApproved(slug: string): Promise<PublicComment[]> {
    const post = await this.findPublicPost(slug);
    const rows = await this.prisma.comment.findMany({
      where: { postId: post.id, status: 'approved' },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    return rows.map(toPublic);
  }

  /** Bình luận mới luôn chờ duyệt — không hiện trên web cho tới khi admin duyệt. */
  async create(slug: string, dto: CreateCommentDto): Promise<{ ok: true }> {
    if (dto.website) return { ok: true }; // Bot điền ô ẩn: giả vờ thành công, không lưu.
    const post = await this.findPublicPost(slug);
    if (/(https?:\/\/|www\.)\S+.*(https?:\/\/|www\.)/is.test(dto.content)) {
      throw new BadRequestException('Bình luận chứa quá nhiều đường link.');
    }
    const comment = await this.prisma.comment.create({
      data: { postId: post.id, name: dto.name, email: dto.email.toLowerCase(), content: dto.content },
    });
    this.realtime.publishAdmin({ type: 'comment.created', id: comment.id, postTitle: post.title, name: comment.name });
    return { ok: true };
  }

  async list(query: CommentQuery): Promise<Paginated<Comment>> {
    const where: Prisma.CommentWhereInput = { status: query.status };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where,
        include: { post: { select: { id: true, slug: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        ...paginate(query),
      }),
      this.prisma.comment.count({ where }),
    ]);
    return { items: rows.map(toComment), total, page: query.page, pageSize: query.pageSize };
  }

  async update(id: string, dto: UpdateCommentDto): Promise<Comment> {
    const existing = await this.prisma.comment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy bình luận.');
    const replyChanged = dto.reply !== undefined && dto.reply !== existing.reply;
    const row = await this.prisma.comment.update({
      where: { id },
      data: {
        status: dto.status,
        reply: dto.reply,
        repliedAt: replyChanged ? (dto.reply ? new Date() : null) : undefined,
        // Trả lời một bình luận đang chờ = đồng ý cho hiện.
        ...(replyChanged && dto.reply && !dto.status && existing.status === 'pending' ? { status: 'approved' as const } : {}),
      },
      include: { post: { select: { id: true, slug: true, title: true } } },
    });
    this.revalidate.notify('content');
    this.realtime.publishAdmin({ type: 'comment.updated', id });
    return toComment(row);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.comment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy bình luận.');
    await this.prisma.comment.delete({ where: { id } });
    this.revalidate.notify('content');
    this.realtime.publishAdmin({ type: 'comment.updated', id });
  }
}

@Controller('posts/:slug/comments')
export class PublicCommentsController {
  constructor(private readonly service: CommentsService) {}

  @Get()
  list(@Param('slug') slug: string) {
    return this.service.listApproved(slug);
  }

  @Post()
  @RateLimit(5, 600)
  create(@Param('slug') slug: string, @Body() dto: CreateCommentDto) {
    return this.service.create(slug, dto);
  }
}

/** Nhân viên cũng duyệt / trả lời được (giống liên hệ). */
@Controller('admin/comments')
@Auth()
@Permission('comments')
export class AdminCommentsController {
  constructor(private readonly service: CommentsService) {}

  @Get()
  list(@Query() query: CommentQuery) {
    return this.service.list(query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCommentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}

@Module({
  controllers: [PublicCommentsController, AdminCommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
