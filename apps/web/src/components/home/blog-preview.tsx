import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getLatestBlogPosts } from "@frozen-fruit-shop/fixtures";
import { formatDate } from "@/lib/format";

export function BlogPreview() {
  const posts = getLatestBlogPosts(3);

  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow="Tin tức" title="Mẹo bảo quản & công thức chế biến" />

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/news/${post.slug}`} className="group">
              <div className="relative aspect-[4/3] w-full bg-surface">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="grayscale-photo object-contain p-8 transition-transform group-hover:scale-105"
                />
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-accent-600">
                {post.category} · {formatDate(post.publishedAt)}
              </p>
              <h3 className="mt-1.5 line-clamp-2 text-[15px] font-bold text-foreground">{post.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-foreground/70">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
