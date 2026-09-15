import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { blogPosts } from "@frozen-fruit-shop/fixtures";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Mẹo bảo quản, công thức chế biến và kiến thức về trái cây đông lạnh.",
};

export default function BlogListPage() {
  return (
    <Container className="py-12">
      <SectionHeading eyebrow="Tin tức" title="Kiến thức & công thức từ trái cây đông lạnh" />

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            href={`/tin-tuc/${post.slug}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg"
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
              <h2 className="mt-2 line-clamp-2 font-display font-medium text-slate-900">{post.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
