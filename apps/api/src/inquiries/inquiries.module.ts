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
import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import type { Inquiry as InquiryRow, Prisma } from '@prisma/client';
import type { Inquiry, Paginated } from '@frozen-fruit-shop/types';
import { Auth } from '../auth/auth.guard.js';
import { PaginationQueryDto, paginate } from '../common/pagination.js';
import { RateLimit } from '../common/rate-limit.guard.js';
import { iso } from '../common/utils.js';
import { Trim } from '../common/validators.js';
import { VN_PHONE } from '../orders/orders.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RealtimeService } from '../realtime/realtime.module.js';

/** "wholesale": liên hệ báo giá sỉ cũ (tính năng sỉ đã bỏ) — vẫn lọc / xem được trong admin. */
const TYPES = ['contact', 'wholesale'] as const;
const STATUSES = ['new', 'in_progress', 'done'] as const;

export class CreateInquiryDto {
  @IsIn(['contact'], { message: 'Loại liên hệ không hợp lệ' })
  type!: 'contact';

  @Trim()
  @IsString()
  @MinLength(2, { message: 'Vui lòng nhập họ tên' })
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @Trim()
  @ValidateIf((_, value) => value !== '')
  @Matches(VN_PHONE, { message: 'Số điện thoại không hợp lệ' })
  phone?: string;

  @IsOptional()
  @Trim()
  @ValidateIf((_, value) => value !== '')
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(120)
  email?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(3000)
  message?: string;

  /** Ô ẩn chống bot. */
  @IsOptional()
  @IsString()
  website?: string;
}

export class InquiryQuery extends PaginationQueryDto {
  @IsOptional()
  @IsIn(TYPES)
  type?: (typeof TYPES)[number];

  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];
}

export class UpdateInquiryDto {
  @IsIn(STATUSES)
  status!: (typeof STATUSES)[number];
}

function toInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    phone: row.phone,
    email: row.email,
    company: row.company,
    quantity: row.quantity,
    message: row.message,
    status: row.status,
    createdAt: iso(row.createdAt),
  };
}

@Injectable()
export class InquiriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async create(dto: CreateInquiryDto): Promise<{ ok: true }> {
    if (dto.website) return { ok: true }; // Bot điền ô ẩn: giả vờ thành công, không lưu.
    if (!dto.phone && !dto.email) {
      throw new BadRequestException('Vui lòng để lại số điện thoại hoặc email để cửa hàng liên hệ lại.');
    }
    if (!dto.message) {
      throw new BadRequestException('Vui lòng nhập nội dung cần hỗ trợ.');
    }

    const inquiry = await this.prisma.inquiry.create({
      data: {
        type: dto.type,
        name: dto.name,
        phone: dto.phone ?? '',
        email: dto.email ?? '',
        message: dto.message ?? '',
      },
    });
    this.realtime.publishAdmin({ type: 'inquiry.created', id: inquiry.id, inquiryType: inquiry.type, name: inquiry.name });
    return { ok: true };
  }

  async list(query: InquiryQuery): Promise<Paginated<Inquiry>> {
    const where: Prisma.InquiryWhereInput = { type: query.type, status: query.status };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.inquiry.findMany({ where, orderBy: { createdAt: 'desc' }, ...paginate(query) }),
      this.prisma.inquiry.count({ where }),
    ]);
    return { items: rows.map(toInquiry), total, page: query.page, pageSize: query.pageSize };
  }

  async update(id: string, dto: UpdateInquiryDto): Promise<Inquiry> {
    await this.ensureExists(id);
    const inquiry = toInquiry(await this.prisma.inquiry.update({ where: { id }, data: { status: dto.status } }));
    this.realtime.publishAdmin({ type: 'inquiry.updated', id });
    return inquiry;
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.inquiry.delete({ where: { id } });
    this.realtime.publishAdmin({ type: 'inquiry.updated', id });
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Không tìm thấy yêu cầu liên hệ.');
  }
}

@Controller('inquiries')
export class PublicInquiriesController {
  constructor(private readonly service: InquiriesService) {}

  @Post()
  @RateLimit(5, 600)
  create(@Body() dto: CreateInquiryDto) {
    return this.service.create(dto);
  }
}

@Controller('admin/inquiries')
@Auth()
export class AdminInquiriesController {
  constructor(private readonly service: InquiriesService) {}

  @Get()
  list(@Query() query: InquiryQuery) {
    return this.service.list(query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}

@Module({
  controllers: [PublicInquiriesController, AdminInquiriesController],
  providers: [InquiriesService],
})
export class InquiriesModule {}
