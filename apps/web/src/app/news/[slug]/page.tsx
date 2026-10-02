import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProductImage } from "@/components/product/product-image";
import { getPost } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Không tìm thấy bài viết" };

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: post.coverImage ? { images: [post.coverImage] } : undefined,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <Container className="py-12">
      <nav className="mb-6 text-sm text-foreground/55" aria-label="Breadcrumb">
        <Link href="/news" className="hover:text-accent-600">Tin tức</Link>
        {" / "}
        <span className="text-foreground/85">{post.title}</span>
      </nav>

      <article className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wide text-accent-600">
          {post.category ? `${post.category} · ` : ""}
          {formatDate(post.publishedAt)}
        </p>
        <h1 className="mt-2 text-2xl uppercase text-foreground sm:text-3xl">{post.title}</h1>

        {post.coverImage ? (
          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden bg-surface">
            <ProductImage src={post.coverImage} alt={post.title} sizes="(min-width: 768px) 768px, 100vw" priority />
          </div>
        ) : null}

        {post.excerpt ? <p className="mt-8 text-lg font-semibold text-foreground/80">{post.excerpt}</p> : null}
        <div className="mt-6 whitespace-pre-line leading-relaxed text-foreground/85">{post.content}</div>
      </article>
    </Container>
  );
}
