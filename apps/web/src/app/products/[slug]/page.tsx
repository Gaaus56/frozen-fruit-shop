import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { RichContent } from "@/components/ui/rich-content";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartForm } from "@/components/product/add-to-cart-form";
import { formatPhone } from "@frozen-fruit-shop/types";
import { getPolicies, getProduct, getSettings } from "@/lib/api";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Không tìm thấy sản phẩm" };

  return {
    title: product.name,
    description: product.shortDescription || undefined,
    openGraph: product.images[0] ? { images: [product.images[0].url] } : undefined,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const [product, settings, policies] = await Promise.all([getProduct(slug), getSettings(), getPolicies()]);
  if (!product) notFound();
  const returnPolicy = policies.find((policy) => policy.slug.includes("doi-tra")) ?? policies[0];
  const assurances = [
    { icon: "❄️", title: "Giao hàng giữ lạnh", text: "Đóng thùng xốp + đá gel, giữ đông suốt đường đi." },
    {
      icon: "↺",
      title: "Đổi trả khi hàng lỗi",
      text: "Quay video lúc mở thùng để được đổi mới hoặc hoàn tiền.",
      href: returnPolicy ? `/policies/${returnPolicy.slug}` : undefined,
    },
    { icon: "☎", title: `Tư vấn ${settings.hotlineHours || ""}`.trim(), text: formatPhone(settings.phone), href: `tel:${settings.phone}` },
  ];

  const { storageInfo } = product;
  const specs = [
    { label: "Danh mục", value: product.category.name },
    { label: "Bảo quản", value: storageInfo.temperature },
    { label: "Hạn sử dụng", value: storageInfo.shelfLifeDays ? `${storageInfo.shelfLifeDays} ngày kể từ ngày sản xuất` : "" },
    { label: "Rã đông", value: storageInfo.thawInstructions },
  ].filter((spec) => spec.value);

  return (
    <Container className="py-12">
      <nav className="mb-6 text-sm text-foreground/55" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-accent-600">Sản phẩm</Link>
        {" / "}
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-accent-600">
          {product.category.name}
        </Link>
        {" / "}
        <span className="text-foreground/85">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <p className="text-[13px] font-bold uppercase tracking-wide text-accent-600">{product.category.name}</p>
          <h1 className="mt-2 text-2xl uppercase text-foreground sm:text-3xl">{product.name}</h1>
          {product.shortDescription ? <p className="mt-4 text-foreground/70">{product.shortDescription}</p> : null}

          <div className="mt-6 border-t border-divider pt-6">
            <AddToCartForm product={product} />
          </div>


          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {assurances.map((item) => {
              const body = (
                <>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf/10 text-sm text-leaf" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-foreground">{item.title}</span>
                    <span className="block text-xs leading-snug text-foreground/60">{item.text}</span>
                  </span>
                </>
              );
              const className = "flex h-full items-start gap-2.5 rounded-xl bg-card p-3 ring-1 ring-divider/70";
              return (
                <li key={item.title}>
                  {item.href ? (
                    <a href={item.href} className={`${className} transition-colors hover:ring-leaf/40`}>{body}</a>
                  ) : (
                    <div className={className}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>

          {specs.length > 0 ? (
            <dl className="mt-6 flex flex-col rounded-xl bg-card px-4 text-sm ring-1 ring-divider/70">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-start justify-between gap-6 border-b border-divider py-2.5 last:border-b-0">
                  <dt className="shrink-0 text-foreground/60">{spec.label}</dt>
                  <dd className="text-right font-semibold text-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>

      {product.description ? (
        <div className="mt-16 border-t border-divider pt-10">
          <h2 className="text-xl uppercase text-foreground">Mô tả chi tiết</h2>
          <RichContent html={product.description} className="mt-3 max-w-3xl" />
        </div>
      ) : null}

      {product.relatedProducts.length > 0 ? (
        <div className="mt-16 border-t border-divider pt-10">
          <SectionHeading title="Sản phẩm cùng loại" />
          <div className="mt-6">
            <ProductGrid products={product.relatedProducts} />
          </div>
        </div>
      ) : null}
    </Container>
  );
}
