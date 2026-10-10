import type { Product } from "@frozen-fruit-shop/types";
import { PRODUCT_EMBED_ATTR, plainTextToHtml } from "@frozen-fruit-shop/types";
import { ProductCard } from "@/components/product/product-card";
import { AutoScrollTrack } from "@/components/home/auto-scroll-track";
import { getProduct } from "@/lib/api";

/**
 * Chỗ hiện thẻ sản phẩm trong bài, đều là khối cấp ngoài cùng nên tách HTML tại đây vẫn giữ đúng thẻ đóng/mở:
 *  1. Ô sản phẩm admin chèn:            <div data-product-slug="xoai-cat"></div>
 *  2. Một dòng chỉ chứa link sản phẩm:  <p><a href="/products/xoai-cat">…</a></p>  (link đầy đủ cũng được)
 */
const PRODUCT_BLOCK = new RegExp(
  `<div ${PRODUCT_EMBED_ATTR}="([a-z0-9-]+)"></div>` +
    `|<p><a href="(?:https?://[^"/]+)?/products/([a-z0-9-]+)/?"[^>]*>[^<]*</a></p>`,
  "g",
);

/** Giữa hai thẻ sản phẩm chỉ có khoảng trắng / dòng trống → coi là cùng một hàng. */
const ONLY_GAP = /^(?:\s|<p>(?:<br\s*\/?>)?<\/p>)*$/;

type Segment = { kind: "html"; html: string } | { kind: "products"; slugs: string[] };

function segment(html: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of html.matchAll(PRODUCT_BLOCK)) {
    const before = html.slice(last, match.index);
    const slug = match[1] ?? match[2];
    const previous = segments.at(-1);
    if (previous?.kind === "products" && ONLY_GAP.test(before)) previous.slugs.push(slug);
    else {
      if (before.trim()) segments.push({ kind: "html", html: before });
      segments.push({ kind: "products", slugs: [slug] });
    }
    last = match.index + match[0].length;
  }
  const rest = html.slice(last);
  if (rest.trim()) segments.push({ kind: "html", html: rest });
  return segments;
}

/**
 * Hiển thị nội dung có định dạng do admin soạn (HTML đã được API lọc an toàn).
 * Ô sản phẩm / link sản phẩm đứng riêng một dòng → thẻ sản phẩm (ảnh, giá hiện tại, nút thêm giỏ);
 * nhiều thẻ liền nhau xếp thành lưới. Sản phẩm đã ẩn / xoá thì bỏ qua.
 */
export async function RichContent({ html, className = "" }: { html: string; className?: string }) {
  const source = plainTextToHtml(html);
  if (!source) return null;

  const segments = segment(source);
  const slugs = [...new Set(segments.flatMap((item) => (item.kind === "products" ? item.slugs : [])))];
  const products = new Map<string, Product>();
  for (const [slug, product] of await Promise.all(slugs.map(async (slug) => [slug, await getProduct(slug)] as const))) {
    if (product) products.set(slug, product);
  }

  return (
    <div className={`rich-content ${className}`}>
      {segments.map((item, index) => {
        if (item.kind === "html") {
          return <div key={index} className="rich-content-flow" dangerouslySetInnerHTML={{ __html: item.html }} />;
        }
        const row = [...new Set(item.slugs)].map((slug) => products.get(slug)).filter((product) => product !== undefined);
        if (row.length === 0) return null;
        return <ProductRow key={index} products={row} />;
      })}
    </div>
  );
}

/** Thẻ hiện đủ cố định: 2 (điện thoại) · 3 (tablet) · 4 (máy tính), không thẻ nào bị cắt nửa. */
const ROW_ITEM = "shrink-0 snap-start [&>a]:h-full w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]";

/**
 * Hàng sản phẩm trong bài: một hàng ngang, tự lướt như khối Danh mục ở trang chủ (AutoScrollTrack) — chỉ lướt khi
 * nhiều sản phẩm hơn số thẻ hiện được; khách vuốt / kéo tay được, chạm vào thì tạm dừng.
 */
function ProductRow({ products }: { products: Product[] }) {
  // Bản sao để vòng lặp liền mạch; chỉ hiện ở breakpoint mà số thẻ vượt quá số thẻ hiển thị.
  const n = products.length;
  const copyVisibility = [n > 2 ? "block" : "hidden", n > 3 ? "sm:block" : "sm:hidden", n > 4 ? "lg:block" : "lg:hidden"].join(" ");

  const renderItem = (product: Product, isCopy: boolean) => (
    <div
      key={isCopy ? `${product.id}-copy` : product.id}
      inert={isCopy || undefined}
      aria-hidden={isCopy || undefined}
      className={`${isCopy ? copyVisibility : "block"} ${ROW_ITEM}`}
    >
      <ProductCard product={product} />
    </div>
  );

  return (
    // py-2: chừa chỗ cho hiệu ứng thẻ nhấc lên khi rê chuột (dải cuộn ngang cắt mất phần tràn dọc).
    <AutoScrollTrack className="rich-content-products my-4 flex snap-x snap-mandatory gap-3 overflow-x-auto py-2 sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {products.map((product) => renderItem(product, false))}
      {products.map((product) => renderItem(product, true))}
    </AutoScrollTrack>
  );
}
