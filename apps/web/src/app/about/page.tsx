import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { RichContent } from "@/components/ui/rich-content";
import { getBanners, getPage, getSettings } from "@/lib/api";
import { editTarget } from "@/lib/edit-target";

/** Ảnh nền khi admin chưa tạo banner nào cho trang Giới thiệu. */
const FALLBACK_BANNER = "/images/banners/banner_v3.jpg";

/** Nội dung trang do admin sửa ở "Trang Giới thiệu"; API trả nội dung mặc định khi chưa sửa lần nào. */
export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return {
    title: "Giới thiệu",
    description: page?.description || "Câu chuyện thương hiệu, tiêu chuẩn chất lượng và quy trình cấp đông trái cây.",
  };
}

export default async function AboutPage() {
  const [page, settings, banners] = await Promise.all([getPage("about"), getSettings(), getBanners("about")]);
  const banner = banners[0];
  // Chữ đặt trên banner (nếu có) thay cho tiêu đề / mô tả của "Trang Giới thiệu".
  const title = banner?.title || page?.title || `Về ${settings.storeName}`;
  const description = banner?.description || page?.description || undefined;

  return (
    <>
      <PageHero
        edit={
          banner
            ? editTarget("banner", banner.id, "Banner đầu trang Giới thiệu")
            : editTarget("bannerNew", "about", "Banner đầu trang Giới thiệu (chưa có — tạo mới)")
        }
        image={banner?.image ?? FALLBACK_BANNER}
        eyebrow="Giới thiệu"
        title={title}
        description={description}
      />

      {page?.content ? (
        <Container className="pb-12 pt-8">
          {/* Khung trắng bo góc giống các khối ở trang chủ (SectionCard). */}
          <div {...editTarget("page", "about", "Nội dung trang Giới thiệu")} className="rounded-2xl border border-divider bg-card px-4 py-6 shadow-sm sm:px-10 sm:py-10">
            <RichContent html={page.content} className="max-w-3xl" />
          </div>
        </Container>
      ) : null}
    </>
  );
}
