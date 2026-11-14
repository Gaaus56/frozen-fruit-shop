import type { Post } from "@frozen-fruit-shop/types";
import { SectionCard } from "@/components/ui/section-card";
import { PostCard } from "@/components/post/post-card";
import { LinkButton } from "@/components/ui/button";
import { AutoScrollTrack } from "@/components/home/auto-scroll-track";

/** Số bài hiện đủ cố định: 1 (điện thoại) · 2 (tablet) · 3 (máy tính), không bài nào bị cắt nửa. */
const ITEM_CLASS =
  "shrink-0 snap-start w-full sm:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]";

export function BlogPreview({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  // Bản sao để vòng lặp liền mạch; chỉ hiện ở breakpoint mà số bài vượt quá số bài hiển thị.
  const n = posts.length;
  const copyVisibility = [n > 1 ? "block" : "hidden", n > 2 ? "sm:block" : "sm:hidden", n > 3 ? "lg:block" : "lg:hidden"].join(" ");

  const renderItem = (post: Post, isCopy: boolean) => (
    <div key={isCopy ? `${post.id}-copy` : post.id} inert={isCopy || undefined} aria-hidden={isCopy || undefined} className={`${isCopy ? copyVisibility : "block"} ${ITEM_CLASS}`}>
      <PostCard post={post} />
    </div>
  );

  return (
    <SectionCard
      title="Tin tức"
      action={
        <LinkButton href="/news" variant="dark" className="rounded-full !px-8 !py-2.5 !text-sm">
          Xem thêm
        </LinkButton>
      }
    >
      <AutoScrollTrack className="flex snap-x snap-mandatory gap-8 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.map((post) => renderItem(post, false))}
        {posts.map((post) => renderItem(post, true))}
      </AutoScrollTrack>
    </SectionCard>
  );
}
