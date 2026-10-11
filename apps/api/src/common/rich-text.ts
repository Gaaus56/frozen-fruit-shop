import sanitizeHtml from 'sanitize-html';
import { BUTTON_STYLES, COLUMN_ATTR, COLUMNS_ATTR, PRODUCT_EMBED_ATTR, TEXT_COLORS, plainTextToHtml } from '@frozen-fruit-shop/types';
import { env } from '../config/env.js';
import { toStoredPath } from './utils.js';

/**
 * Nội dung có định dạng (bài viết, chính sách, mô tả sản phẩm, trang Giới thiệu) lưu dạng HTML.
 * Không tin HTML từ trình duyệt: chỉ giữ đúng những thẻ trình soạn thảo của admin tạo ra.
 *
 *   p, h2, h3, strong, em, u, s, br, hr, ul, ol, li, blockquote
 *   a[href]                         — http(s), mailto:, tel:, đường dẫn trong web "/..."
 *   figure > img[src, alt] + figcaption — ảnh có chú thích
 *   aside[data-tone=green|red]      — khung ghi chú nổi bật
 *   div[data-product-slug]          — ô sản phẩm (web thay bằng thẻ sản phẩm thật)
 *   div[data-columns=2] > div[data-column] — bố cục chia đôi trái / phải
 *   span[data-color=red|green|gray] — màu chữ trong chủ đề web (không nhận mã màu tự do)
 *   p/h2/h3[data-align=center|right] — căn giữa / phải
 *   div[data-columns][data-valign=top|bottom] — căn dọc hai cột
 *   p[data-buttons] > a[data-button=red|dark|light|green] — hàng nút điều hướng
 */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALIGN = { name: 'data-align', multiple: false, values: ['center', 'right'] };

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'h2', 'h3', 'strong', 'em', 'u', 's', 'br', 'hr', 'ul', 'ol', 'li', 'blockquote', 'a', 'figure', 'img', 'figcaption', 'aside', 'div', 'span'],
  allowedAttributes: {
    a: ['href', 'target', 'rel', { name: 'data-button', multiple: false, values: [...BUTTON_STYLES] }],
    p: [ALIGN, 'data-buttons'],
    h2: [ALIGN],
    h3: [ALIGN],
    img: ['src', 'alt', 'loading'],
    aside: ['data-tone'],
    div: [PRODUCT_EMBED_ATTR, { name: COLUMNS_ATTR, multiple: false, values: ['2'] }, { name: 'data-valign', multiple: false, values: ['top', 'bottom'] }, COLUMN_ATTR],
    span: [{ name: 'data-color', multiple: false, values: [...TEXT_COLORS] }],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
  // Tiêu đề h1 dành cho tiêu đề trang → hạ xuống h2; h4+ → h3.
  transformTags: {
    h1: 'h2',
    h4: 'h3',
    h5: 'h3',
    h6: 'h3',
    b: 'strong',
    i: 'em',
    a: (tagName, attribs) => {
      const href = attribs.href ?? '';
      const external = /^https?:\/\//i.test(href) && !href.startsWith(env.publicUrl);
      const result: sanitizeHtml.Attributes = external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href };
      // Giữ kiểu nút (allowedAttributes lọc lại giá trị hợp lệ sau bước này).
      if (attribs['data-button']) result['data-button'] = attribs['data-button'];
      return { tagName, attribs: result };
    },
    // Ảnh của chính API lưu dạng "/uploads/..." để đổi tên miền không hỏng ảnh (xem toRichTextOutput).
    img: (tagName, attribs) => ({
      tagName,
      attribs: { src: toStoredPath(attribs.src ?? '') ?? '', alt: (attribs.alt ?? '').slice(0, 200), loading: 'lazy' },
    }),
  },
  exclusiveFilter: (frame) => {
    // div chỉ dùng cho ô sản phẩm và bố cục cột; div khác (dán từ web ngoài) bị bỏ.
    if (frame.tag === 'div') {
      return !(SLUG.test(frame.attribs[PRODUCT_EMBED_ATTR] ?? '') || frame.attribs[COLUMNS_ATTR] === '2' || COLUMN_ATTR in frame.attribs);
    }
    if (frame.tag === 'aside') return !['green', 'red'].includes(frame.attribs['data-tone'] ?? '');
    if (frame.tag === 'img') return !/^(\/uploads\/|https?:\/\/)/i.test(frame.attribs.src ?? '');
    return false;
  },
};

/** Lọc HTML trước khi lưu. Nội dung chữ thường (cũ) được chuyển sang HTML. */
export function sanitizeRichText(input: string | undefined | null): string {
  if (!input?.trim()) return '';
  return sanitizeHtml(plainTextToHtml(input), OPTIONS).trim();
}

/**
 * Trước khi trả ra: chữ thường cũ → HTML; ảnh "/uploads/..." → URL đầy đủ theo PUBLIC_URL;
 * link ra ngoài (http/https) chưa có `target` → mở tab mới (nội dung lưu trước khi có quy tắc ở transformTags.a).
 */
export function toRichTextOutput(stored: string): string {
  return plainTextToHtml(stored)
    .replace(/(<img\b[^>]*\bsrc=")\/uploads\//g, `$1${env.publicUrl}/uploads/`)
    .replace(/<a\b(?![^>]*\btarget=)([^>]*\bhref="https?:\/\/[^"]*"[^>]*)>/gi, '<a$1 target="_blank" rel="noopener noreferrer">');
}
