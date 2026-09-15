import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getLatestBlogPosts } from "@frozen-fruit-shop/fixtures";
import { formatDate } from "@/lib/format";

export function BlogPreview() {
  const posts = getLatestBlogPosts(3);

  return (
    <section className="py-12">
      <Container>
        <SectionHeading eyebrow="Tin tức" title="Mẹo bảo quản & công thức chế biến" />

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/tin-tuc/${post.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
            >
              <div className="relative aspect-[16/10] w-full bg-teal-50/60">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-contain p-6 transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-600">
                  {post.category} · {formatDate(post.publishedAt)}
                </p>
                <h3 className="mt-2 line-clamp-2 font-display font-medium text-slate-900">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
