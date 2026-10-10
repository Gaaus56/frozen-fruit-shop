import Link from "next/link";
import { POST_TYPE_LABELS, type Post } from "@frozen-fruit-shop/types";
import { ProductImage } from "@/components/product/product-image";

/** `showType`: hiện nhãn Kiến thức / Tuyển dụng — tắt khi danh sách đã lọc theo một loại. */
export function PostCard({ post, showType = true }: { post: Post; showType?: boolean }) {
  return (
    <Link href={`/news/${post.slug}`} className="group min-w-0 [overflow-wrap:anywhere]">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface ring-1 ring-divider/70">
        <ProductImage
          src={post.coverImage}
          alt={post.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
        {showType && post.type === "recruitment" ? (
          <span className="absolute left-3 top-3 rounded-full bg-leaf px-2.5 py-1 text-xs font-bold text-white">
            {POST_TYPE_LABELS.recruitment}
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 line-clamp-2 text-[15px] font-bold text-foreground group-hover:text-accent-700">
        {post.title}
      </h3>
      {post.excerpt ? <p className="mt-1.5 line-clamp-2 text-sm text-foreground/70">{post.excerpt}</p> : null}
    </Link>
  );
}
