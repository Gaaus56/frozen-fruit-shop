import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { RichContent } from "@/components/ui/rich-content";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPage, getSettings } from "@/lib/api";

/** Nội dung trang do admin sửa ở "Trang Giới thiệu"; API trả nội dung mặc định khi chưa sửa lần nào. */
export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return {
    title: "Giới thiệu",
    description: page?.description || "Câu chuyện thương hiệu, tiêu chuẩn chất lượng và quy trình cấp đông trái cây.",
  };
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getPage("about"), getSettings()]);

  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Giới thiệu"
        title={page?.title || `Về ${settings.storeName}`}
        description={page?.description || undefined}
      />
      {page?.content ? <RichContent html={page.content} className="mt-8 max-w-3xl" /> : null}
    </Container>
  );
}
