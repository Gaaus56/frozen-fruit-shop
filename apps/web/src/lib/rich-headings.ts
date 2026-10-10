import { plainTextToHtml } from "@frozen-fruit-shop/types";

export interface Heading {
  id: string;
  level: 2 | 3;
  text: string;
}

/** API đã lọc HTML nên tiêu đề luôn ở dạng trần <h2>…</h2> / <h3>…</h3> (không thuộc tính). */
const HEADING = /<h([23])>([\s\S]*?)<\/h\1>/g;

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

function toText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

/** Mốc theo thứ tự xuất hiện: muc-1, muc-2… — ổn định, không phụ thuộc chữ tiếng Việt. */
const headingId = (index: number) => `muc-${index + 1}`;

/** Danh sách tiêu đề (h2, h3) của bài để làm mục lục. Tiêu đề rỗng bị bỏ qua nhưng vẫn giữ số thứ tự mốc. */
export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  let index = 0;
  for (const match of plainTextToHtml(content).matchAll(HEADING)) {
    const text = toText(match[2]);
    if (text) headings.push({ id: headingId(index), level: match[1] === "2" ? 2 : 3, text });
    index += 1;
  }
  return headings;
}

/** Gắn id cho từng tiêu đề để mục lục bấm nhảy tới được (cùng thứ tự với extractHeadings). */
export function withHeadingIds(content: string): string {
  let index = 0;
  return plainTextToHtml(content).replace(HEADING, (_match, level: string, inner: string) => `<h${level} id="${headingId(index++)}">${inner}</h${level}>`);
}
