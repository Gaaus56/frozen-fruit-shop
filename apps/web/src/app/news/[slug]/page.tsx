import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { RichContent } from "@/components/ui/rich-content";
import { ProductImage } from "@/components/product/product-image";
import { POST_TYPE_LABELS, POST_TYPE_SLUGS, formatPhone } from "@frozen-fruit-shop/types";
import { getPost, getSettings } from "@/lib/api";
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
  const [post, settings] = await Promise.all([getPost(slug), getSettings()]);
  if (!post) notFound();
  const typeHref = `/news?type=${POST_TYPE_SLUGS[post.type]}`;
  const zalo = (settings.zaloPhone || settings.phone).replace(/\D/g, "");

  return (
    <Container className="py-12">
      <nav className="mb-6 text-sm text-foreground/55" aria-label="Breadcrumb">
        <Link href="/news" className="hover:text-accent-600">Tin tức</Link>
        {" / "}
        <Link href={typeHref} className="hover:text-accent-600">{POST_TYPE_LABELS[post.type]}</Link>
        {" / "}
        <span className="text-foreground/85">{post.title}</span>
      </nav>

      <article className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wide text-accent-600">
          <Link href={typeHref} className="hover:underline">{POST_TYPE_LABELS[post.type]}</Link>
          {" · "}
          {formatDate(post.publishedAt)}
        </p>
        <h1 className="mt-2 text-2xl uppercase text-foreground sm:text-3xl">{post.title}</h1>

        {post.coverImage ? (
          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl bg-surface">
            <ProductImage src={post.coverImage} alt={post.title} sizes="(min-width: 768px) 768px, 100vw" priority />
          </div>
        ) : null}

        {post.excerpt ? <p className="mt-8 text-lg font-semibold text-foreground/80">{post.excerpt}</p> : null}
        <RichContent html={post.content} className="mt-6" />

        {post.type === "recruitment" ? (
          <section className="mt-10 rounded-xl bg-leaf/[0.07] p-6 ring-1 ring-leaf/25" aria-labelledby="apply-heading">
            <h2 id="apply-heading" className="text-lg font-extrabold text-leaf">Ứng tuyển</h2>
            <p className="mt-1 text-sm text-foreground/70">
              Gửi họ tên, số điện thoại và vị trí ứng tuyển cho cửa hàng qua một trong các cách sau:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`https://zalo.me/${zalo}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-leaf px-4 py-2.5 text-sm font-bold text-white hover:bg-leaf/90">
                Nhắn Zalo {formatPhone(zalo)}
              </a>
              <a href={`tel:${settings.phone}`} className="rounded-lg border border-leaf/40 px-4 py-2.5 text-sm font-bold text-leaf hover:bg-leaf/10">
                Gọi {formatPhone(settings.phone)}
              </a>
              {settings.email ? (
                <a href={`mailto:${settings.email}?subject=${encodeURIComponent(`Ứng tuyển: ${post.title}`)}`} className="rounded-lg border border-leaf/40 px-4 py-2.5 text-sm font-bold text-leaf hover:bg-leaf/10">
                  Gửi email
                </a>
              ) : null}
            </div>
          </section>
        ) : null}
      </article>
    </Container>
  );
}
