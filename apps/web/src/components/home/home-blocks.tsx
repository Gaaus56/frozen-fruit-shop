import type { HomeBlock, HomeBlockPosition } from "@frozen-fruit-shop/types";
import { RichContent } from "@/components/ui/rich-content";
import { SectionCard, SectionTitle } from "@/components/ui/section-card";

/**
 * Các khối nội dung admin tự soạn (mục "Khối trang chủ") ở một vị trí trên trang chủ.
 * Có khung: giống các phần Danh mục / Sản phẩm / Tin tức. Không khung: nằm thẳng trên nền trang.
 */
export function HomeBlocks({ blocks, position }: { blocks: HomeBlock[]; position: HomeBlockPosition }) {
  const items = blocks.filter((block) => block.position === position && (block.title || block.content));
  if (items.length === 0) return null;

  return (
    <>
      {items.map((block) =>
        block.framed ? (
          <SectionCard key={block.id} title={block.title || undefined}>
            <RichContent html={block.content} />
          </SectionCard>
        ) : (
          <section key={block.id} className="px-1 py-4 sm:py-6">
            {block.title ? <SectionTitle title={block.title} /> : null}
            <RichContent html={block.content} />
          </section>
        ),
      )}
    </>
  );
}
