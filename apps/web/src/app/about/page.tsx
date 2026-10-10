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
        as="h1"
        eyebrow="Giới thiệu"
        title={page?.title || `Về ${settings.storeName}`}
        description={page?.description || undefined}
      />
      {/* Khung trắng bo góc giống các khối ở trang chủ (SectionCard). */}
      {page?.content ? (
        <div className="mt-8 rounded-2xl border border-divider bg-card px-4 py-6 shadow-sm sm:px-10 sm:py-10">
          <RichContent html={page.content} className="max-w-3xl" />
        </div>
      ) : null}
    </Container>
  );
}
