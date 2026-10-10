import { Body, Controller, Get, Injectable, NotFoundException, Param, Put } from '@nestjs/common';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { DEFAULT_SITE_SETTINGS, PAGE_SLUGS, type Page, type PageSlug } from '@frozen-fruit-shop/types';
import { Auth } from '../auth/auth.guard.js';
import { sanitizeRichText, toRichTextOutput } from '../common/rich-text.js';
import { iso } from '../common/utils.js';
import { Trim } from '../common/validators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RevalidateService } from '../revalidate/revalidate.service.js';

export class SavePageDto {
  @Trim()
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập tiêu đề' })
  @MaxLength(150)
  title!: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(300)
  description?: string;

  /** HTML từ trình soạn thảo — được lọc lại trước khi lưu. */
  @IsOptional()
  @IsString()
  @MaxLength(300_000)
  content?: string;
}

/** Nội dung mặc định = nội dung trang đang có trước khi admin sửa lần đầu. `{storeName}` thay bằng tên cửa hàng. */
const DEFAULTS: Record<PageSlug, Omit<Page, 'slug' | 'updatedAt'>> = {
  about: {
    title: 'Về {storeName}',
    description: 'Chúng tôi mang đến trái cây đông lạnh chất lượng, tiện lợi cho mọi gia đình.',
    content: [
      '<p>{storeName} ra đời với sứ mệnh mang đến nguồn trái cây đông lạnh chất lượng cao, được cấp đông ngay sau thu hoạch để giữ trọn hương vị và dinh dưỡng tự nhiên. Chúng tôi tin rằng trái cây đông lạnh không chỉ tiện lợi mà còn có thể ngon và bổ dưỡng không kém trái cây tươi.</p>',
      '<p>Với quy trình sơ chế, cấp đông và đóng gói khép kín, sản phẩm của chúng tôi phù hợp cho nhu cầu sử dụng hằng ngày của gia đình lẫn các quán cà phê, nhà hàng cần nguồn nguyên liệu ổn định quanh năm.</p>',
      '<h2>Cam kết chất lượng</h2>',
      '<h3>Nguồn nguyên liệu chuẩn VietGAP</h3><p>Trái cây được thu mua từ các vùng trồng đạt chuẩn VietGAP, kiểm soát chặt chẽ từ khâu canh tác.</p>',
      '<h3>Cấp đông nhanh (IQF)</h3><p>Trái cây được cấp đông nhanh ở nhiệt độ -35°C ngay sau sơ chế, giữ trọn cấu trúc và dinh dưỡng.</p>',
      '<h3>Đóng gói hút chân không</h3><p>Hạn chế oxy hoá, giữ hương vị tươi ngon trong suốt thời gian bảo quản.</p>',
      '<h3>Không chất bảo quản</h3><p>Sản phẩm hoàn toàn tự nhiên, không sử dụng chất bảo quản hay phụ gia.</p>',
    ].join(''),
  },
};

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  async find(slug: string): Promise<Page> {
    const pageSlug = PAGE_SLUGS.find((value) => value === slug);
    if (!pageSlug) throw new NotFoundException('Không tìm thấy trang.');
    const row = await this.prisma.page.findUnique({ where: { slug: pageSlug } });
    if (!row) return { slug: pageSlug, ...(await this.defaults(pageSlug)), updatedAt: null };
    return {
      slug: pageSlug,
      title: row.title,
      description: row.description,
      content: toRichTextOutput(row.content),
      updatedAt: iso(row.updatedAt),
    };
  }

  /** Nội dung mặc định, thay {storeName} bằng tên cửa hàng hiện tại để admin mở ra thấy đúng chữ sẽ hiển thị. */
  private async defaults(slug: PageSlug) {
    const settings = await this.prisma.siteSetting.findUnique({ where: { id: 1 }, select: { storeName: true } });
    const storeName = settings?.storeName ?? DEFAULT_SITE_SETTINGS.storeName;
    const fill = (text: string) => text.replaceAll('{storeName}', storeName);
    const page = DEFAULTS[slug];
    return { title: fill(page.title), description: fill(page.description), content: fill(page.content) };
  }

  async save(slug: string, dto: SavePageDto): Promise<Page> {
    const pageSlug = PAGE_SLUGS.find((value) => value === slug);
    if (!pageSlug) throw new NotFoundException('Không tìm thấy trang.');
    const data = { title: dto.title, description: dto.description ?? '', content: sanitizeRichText(dto.content) };
    await this.prisma.page.upsert({ where: { slug: pageSlug }, create: { slug: pageSlug, ...data }, update: data });
    this.revalidate.notify('content');
    return this.find(pageSlug);
  }
}

@Controller('pages')
export class PublicPagesController {
  constructor(private readonly service: PagesService) {}

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.find(slug);
  }
}

/** Nhân viên cũng sửa được (giống bài viết, chính sách). */
@Controller('admin/pages')
@Auth()
export class AdminPagesController {
  constructor(private readonly service: PagesService) {}

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.find(slug);
  }

  @Put(':slug')
  save(@Param('slug') slug: string, @Body() dto: SavePageDto) {
    return this.service.save(slug, dto);
  }
}
