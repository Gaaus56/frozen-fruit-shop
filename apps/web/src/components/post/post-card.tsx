import Link from "next/link";
import type { Post } from "@frozen-fruit-shop/types";
import { ProductImage } from "@/components/product/product-image";
import { formatDate } from "@/lib/format";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/news/${post.slug}`} className="group">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        <ProductImage
          src={post.coverImage}
          alt={post.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-accent-600">
        {post.category ? `${post.category} · ` : ""}
        {formatDate(post.publishedAt)}
      </p>
      <h3 className="mt-1.5 line-clamp-2 text-[15px] font-bold text-foreground group-hover:text-accent-700">
        {post.title}
      </h3>
      {post.excerpt ? <p className="mt-1.5 line-clamp-2 text-sm text-foreground/70">{post.excerpt}</p> : null}
    </Link>
  );
}
