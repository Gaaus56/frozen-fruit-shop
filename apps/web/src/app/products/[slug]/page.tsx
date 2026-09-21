import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { StarRating } from "@/components/ui/star-rating";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { AddToCartForm } from "@/components/product/add-to-cart-form";
import { getProductBySlug, getRelatedProducts, products, getCategoryBySlug } from "@frozen-fruit-shop/fixtures";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = getCategoryBySlug(product.categorySlug);
  const relatedProducts = getRelatedProducts(product);
  const defaultVariant = product.variants[0];

  const specs = [
    { label: "Danh mục", value: category?.name ?? "—" },
    { label: "Quy cách", value: `Túi hút chân không ${defaultVariant.packageSize}` },
    { label: "Bảo quản", value: product.storageInfo.temperature },
    { label: "Hạn sử dụng", value: `${product.storageInfo.shelfLifeDays} ngày kể từ ngày sản xuất` },
    { label: "Rã đông", value: product.storageInfo.thawInstructions },
  ];

  return (
    <Container className="py-12">
      <nav className="mb-6 text-sm text-foreground/55">
        <Link href="/products" className="hover:text-accent-600">Sản phẩm</Link>
        {category ? (
          <>
            {" / "}
            <Link href={`/products?category=${category.slug}`} className="hover:text-accent-600">
              {category.name}
            </Link>
          </>
        ) : null}
        {" / "}
        <span className="text-foreground/85">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="relative aspect-square w-full bg-surface">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="grayscale-photo object-contain p-10"
            priority
          />
        </div>

        <div>
          {category ? <p className="text-[13px] font-bold uppercase tracking-wide text-accent-600">{category.name}</p> : null}
          <h1 className="mt-2 text-2xl uppercase text-foreground sm:text-3xl">{product.name}</h1>
          <div className="mt-3">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
          <p className="mt-4 text-foreground/70">{product.shortDescription}</p>

          <div className="mt-6 border-t border-divider pt-6">
            <AddToCartForm product={product} />
          </div>

          {product.isWholesaleAvailable ? (
            <p className="mt-4 text-sm text-foreground/70">
              Cần mua số lượng lớn?{" "}
              <Link href="/contact" className="font-bold text-accent-700 hover:underline">
                Liên hệ để được báo giá sỉ
              </Link>
            </p>
          ) : null}

          <dl className="mt-8 flex flex-col gap-0 border-t border-divider text-sm">
            {specs.map((spec) => (
              <div key={spec.label} className="flex items-center justify-between gap-4 border-b border-divider py-2.5">
                <dt className="text-foreground/60">{spec.label}</dt>
                <dd className="font-semibold text-foreground">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-16 border-t border-divider pt-10">
        <h2 className="text-xl uppercase text-foreground">Mô tả chi tiết</h2>
        <p className="mt-3 max-w-3xl text-foreground/70">{product.description}</p>
      </div>

      {relatedProducts.length > 0 ? (
        <div className="mt-16 border-t border-divider pt-10">
          <SectionHeading title="Sản phẩm liên quan" />
          <div className="mt-6">
            <ProductGrid products={relatedProducts} />
          </div>
        </div>
      ) : null}
    </Container>
  );
}
