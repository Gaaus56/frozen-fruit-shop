import type { Metadata } from "next";
import { POST_TYPES, formatPhone, POST_TYPE_LABELS, POST_TYPE_SLUGS, type PostType } from "@frozen-fruit-shop/types";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/ui/page-hero";
import { FilterChip, FilterChips } from "@/components/ui/filter-chips";
import { PostCard } from "@/components/post/post-card";
import { getBanners, getPosts, getSettings } from "@/lib/api";
import { editTarget } from "@/lib/edit-target";

interface NewsPageProps {
  searchParams: Promise<{ type?: string }>;
}

/** Ảnh nền khi admin chưa tạo banner nào cho trang Tin tức. */
const FALLBACK_BANNER = "/images/banners/news-default.jpg";

const HEADINGS: Record<PostType | "all", { title: string; description: string }> = {
  all: { title: "Tin tức", description: "Kiến thức về trái cây đông lạnh và cơ hội làm việc cùng cửa hàng." },
  knowledge: { title: "Kiến thức", description: "Mẹo bảo quản, rã đông và công thức chế biến từ trái cây đông lạnh." },
  recruitment: { title: "Tuyển dụng", description: "Các vị trí cửa hàng đang tìm người đồng hành." },
};

/** "kien-thuc" / "tuyen-dung" trên URL → loại bài viết; giá trị lạ coi như xem tất cả. */
function parseType(slug: string | undefined): PostType | undefined {
  return POST_TYPES.find((type) => POST_TYPE_SLUGS[type] === slug);
}

export async function generateMetadata({ searchParams }: NewsPageProps): Promise<Metadata> {
  const heading = HEADINGS[parseType((await searchParams).type) ?? "all"];
  return { title: heading.title, description: heading.description };
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const type = parseType((await searchParams).type);
  const [posts, settings, banners] = await Promise.all([getPosts(undefined, type), getSettings(), getBanners("news")]);
  const banner = banners[0];
  // Đang lọc một loại thì tiêu đề theo loại; xem tất cả thì dùng chữ admin đặt trên banner (nếu có).
  const heading = type
    ? HEADINGS[type]
    : { title: banner?.title || HEADINGS.all.title, description: banner?.description || HEADINGS.all.description };

  return (
    <>
      <PageHero
        edit={
          banner
            ? editTarget("banner", banner.id, "Banner đầu trang Tin tức")
            : editTarget("bannerNew", "news", "Banner đầu trang Tin tức (chưa có — tạo mới)")
        }
        image={banner?.image ?? FALLBACK_BANNER}
        eyebrow="Tin tức"
        title={heading.title}
        description={heading.description}
      >
        <FilterChips label="Loại bài viết">
          <FilterChip href="/news" active={!type}>
            Tất cả
          </FilterChip>
          {POST_TYPES.map((value) => (
            <FilterChip key={value} href={`/news?type=${POST_TYPE_SLUGS[value]}`} active={type === value}>
              {POST_TYPE_LABELS[value]}
            </FilterChip>
          ))}
        </FilterChips>
      </PageHero>

      <section className="pb-12 pt-8" aria-labelledby="post-list-heading">
        <Container>
          <h2 id="post-list-heading" className="sr-only">
            Danh sách bài viết
          </h2>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} showType={!type} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-card px-6 py-14 text-center ring-1 ring-divider/70">
              <span className="text-4xl" aria-hidden>
                {type === "recruitment" ? "🧑‍🍳" : "📰"}
              </span>
              {type === "recruitment" ? (
                <p className="max-w-md text-foreground/70">
                  Hiện cửa hàng chưa có vị trí tuyển dụng. Bạn vẫn có thể gửi thông tin qua Zalo{" "}
                  <a
                    href={`https://zalo.me/${(settings.zaloPhone || settings.phone).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-accent-700 hover:underline"
                  >
                    {formatPhone(settings.zaloPhone || settings.phone)}
                  </a>{" "}
                  để được báo khi có vị trí phù hợp.
                </p>
              ) : (
                <p className="max-w-md text-foreground/70">Chưa có bài viết nào. Vui lòng quay lại sau.</p>
              )}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
