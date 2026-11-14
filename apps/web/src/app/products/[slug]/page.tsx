import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { RichContent } from "@/components/ui/rich-content";
import { SectionCard } from "@/components/ui/section-card";
import { BackButton } from "@/components/ui/back-button";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartForm } from "@/components/product/add-to-cart-form";
import { fillSettingsPlaceholders } from "@frozen-fruit-shop/types";
import { getPolicies, getProduct, getSettings } from "@/lib/api";
import { editSettings, editTarget } from "@/lib/edit-target";
import { AssuranceIconView } from "@/components/ui/line-icon";

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
  // Thẻ cam kết do admin chỉnh ở "Thông tin cửa hàng". Link tới chính sách đã xoá / tắt thì bỏ link để khách không gặp trang 404.
  const activePolicyPaths = new Set(policies.map((policy) => `/policies/${policy.slug}`));
  const assurances = settings.productAssurances.map((item) => {
    const href = fillSettingsPlaceholders(item.linkUrl, settings);
    return {
      icon: item.icon,
      title: fillSettingsPlaceholders(item.title, settings),
      text: fillSettingsPlaceholders(item.text, settings),
      href: !href || (href.startsWith("/policies/") && !activePolicyPaths.has(href)) ? undefined : href,
    };
  });

  const { storageInfo } = product;
  const specs = [
    { label: "Danh mục", value: product.category.name },
    { label: "Bảo quản", value: storageInfo.temperature },
    { label: "Hạn sử dụng", value: storageInfo.shelfLifeDays ? `${storageInfo.shelfLifeDays} ngày kể từ ngày sản xuất` : "" },
    { label: "Rã đông", value: storageInfo.thawInstructions },
  ].filter((spec) => spec.value);

  return (
    <Container className="flex flex-col gap-6 py-6 sm:py-8 lg:py-12">
      {/* Khung trắng bo góc giống các khối ở trang chủ (SectionCard): ảnh + thông tin mua hàng. */}
      <section
        {...editTarget("product", product.id, `Sản phẩm: ${product.name}`)}
        className="grid grid-cols-1 gap-8 rounded-2xl border border-divider bg-card p-4 shadow-sm sm:p-7 lg:grid-cols-2 lg:gap-12"
      >
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {/* Nút quay lại thay cho đường dẫn breadcrumb. */}
          <div className="flex items-center gap-3">
            <BackButton fallbackHref={`/products?category=${product.category.slug}`} label="Quay lại danh sách sản phẩm" />
            <p className="text-[13px] font-bold uppercase tracking-wide text-accent-600">
              <Link href={`/products?category=${product.category.slug}`} className="hover:underline">{product.category.name}</Link>
            </p>
          </div>
          <h1 className="mt-2 text-2xl uppercase text-foreground sm:text-3xl">{product.name}</h1>
          {product.shortDescription ? <p className="mt-4 text-foreground/70">{product.shortDescription}</p> : null}

          <div className="mt-6 border-t border-divider pt-6">
            <AddToCartForm product={product} />
          </div>

          {assurances.length > 0 ? (
            <ul
              {...editSettings("assurances", "Thẻ cam kết trang sản phẩm")}
              className={`mt-6 grid grid-cols-1 gap-2 ${assurances.length === 1 ? "" : assurances.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
              {assurances.map((item, index) => {
                const body = (
                  <>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf/10 text-leaf" aria-hidden>
                      <AssuranceIconView icon={item.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-foreground">{item.title}</span>
                      <span className="block text-xs leading-snug text-foreground/65">{item.text}</span>
                    </span>
                  </>
                );
                // Nằm trong khung trắng nên dùng nền xám ấm để tách thành ô riêng.
                const className = "flex h-full items-start gap-2.5 rounded-xl bg-field p-3 ring-1 ring-divider/50";
                return (
                  <li key={index}>
                    {item.href ? (
                      <a
                        href={item.href}
                        {...(/^https?:/.test(item.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={`${className} transition-colors hover:ring-leaf/40`}
                      >
                        {body}
                      </a>
                    ) : (
                      <div className={className}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </section>

      {specs.length > 0 || product.description ? (
        <SectionCard title="Thông tin sản phẩm" edit={editTarget("product", product.id, `Thông tin sản phẩm: ${product.name}`)}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {specs.length > 0 ? (
              // Không có mô tả chi tiết: bảng thông tin đứng một mình, căn giữa khung.
              <dl
                className={`flex h-fit flex-col rounded-xl bg-field px-4 text-sm ring-1 ring-divider/50 ${
                  product.description ? "lg:order-last" : "mx-auto w-full max-w-xl lg:col-span-3"
                }`}
              >
                {specs.map((spec) => (
                  <div key={spec.label} className="flex items-start justify-between gap-6 border-b border-divider py-2.5 last:border-b-0">
                    <dt className="shrink-0 text-foreground/65">{spec.label}</dt>
                    <dd className="text-right font-semibold text-foreground">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {product.description ? (
              <RichContent html={product.description} className={specs.length > 0 ? "lg:col-span-2" : "lg:col-span-3"} />
            ) : null}
          </div>
        </SectionCard>
      ) : null}

      {product.relatedProducts.length > 0 ? (
        <SectionCard title="Sản phẩm cùng loại">
          <ProductGrid products={product.relatedProducts} />
        </SectionCard>
      ) : null}
    </Container>
  );
}
