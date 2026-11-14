import type { HomeBlock, HomeBlockPosition } from "@frozen-fruit-shop/types";
import { RichContent } from "@/components/ui/rich-content";
import { SectionCard, SectionTitle } from "@/components/ui/section-card";
import { editTarget } from "@/lib/edit-target";

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
          <div key={block.id} {...editTarget("homeBlock", block.id, `Khối trang chủ${block.title ? `: ${block.title}` : ""}`)}>
            <SectionCard title={block.title || undefined}>
              <RichContent html={block.content} />
            </SectionCard>
          </div>
        ) : (
          <section
            key={block.id}
            {...editTarget("homeBlock", block.id, `Khối trang chủ${block.title ? `: ${block.title}` : ""}`)}
            // Không khung: nằm thẳng trên nền trang, khoảng trống rộng như phần đầu trang chủ.
            className="px-1 py-10 sm:py-14 lg:py-16"
          >
            {block.title ? <SectionTitle title={block.title} /> : null}
            <RichContent html={block.content} />
          </section>
        ),
      )}
    </>
  );
}
