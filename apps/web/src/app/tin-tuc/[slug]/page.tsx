import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { blogPosts, getBlogPostBySlug } from "@frozen-fruit-shop/fixtures";
import { formatDate } from "@/lib/format";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <Container className="py-12">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/tin-tuc" className="hover:text-teal-600">Tin tức</Link>
        {" / "}
        <span className="text-slate-700">{post.title}</span>
      </nav>

      <p className="text-xs font-bold uppercase tracking-wide text-teal-600">
        {post.category} · {formatDate(post.publishedAt)}
      </p>
      <h1 className="mt-2 max-w-3xl font-display text-2xl font-semibold text-slate-900 sm:text-3xl">{post.title}</h1>

      <div className="relative mt-6 aspect-[16/8] w-full max-w-3xl rounded-2xl bg-teal-50/60">
        <Image src={post.coverImage} alt={post.title} fill className="object-contain p-10" />
      </div>

      <div className="mt-8 max-w-3xl space-y-4 text-slate-700">
        <p>{post.content}</p>
      </div>
    </Container>
  );
}
