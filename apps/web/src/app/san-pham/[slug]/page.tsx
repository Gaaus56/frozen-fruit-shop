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

  return (
    <Container className="py-10">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/san-pham" className="hover:text-teal-600">Sản phẩm</Link>
        {category ? (
          <>
            {" / "}
            <Link href={`/san-pham?danh-muc=${category.slug}`} className="hover:text-teal-600">
              {category.name}
            </Link>
          </>
        ) : null}
        {" / "}
        <span className="text-slate-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="relative aspect-square w-full rounded-2xl bg-teal-50/60">
          <Image src={product.images[0]} alt={product.name} fill className="object-contain p-10" priority />
        </div>

        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">{product.name}</h1>
          <div className="mt-2">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
          <p className="mt-4 text-slate-600">{product.shortDescription}</p>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <AddToCartForm product={product} />
          </div>

          <div className="mt-8 rounded-2xl border border-teal-100 bg-teal-50/70 p-5">
            <p className="font-semibold text-teal-800">🧊 Bảo quản & sử dụng</p>
            <ul className="mt-2 space-y-1 text-sm text-teal-900">
              <li>Nhiệt độ bảo quản: {product.storageInfo.temperature}</li>
              <li>Hạn sử dụng: {product.storageInfo.shelfLifeDays} ngày kể từ ngày sản xuất</li>
              <li>Hướng dẫn rã đông: {product.storageInfo.thawInstructions}</li>
            </ul>
          </div>

          {product.isWholesaleAvailable ? (
            <p className="mt-4 text-sm text-slate-600">
              Cần mua số lượng lớn?{" "}
              <Link href="/dat-hang-si" className="font-semibold text-mango-700 hover:underline">
                Xem chính sách đặt hàng sỉ
              </Link>
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-14 border-t border-slate-200 pt-10">
        <h2 className="font-display text-xl font-semibold text-slate-900">Mô tả chi tiết</h2>
        <p className="mt-3 max-w-3xl text-slate-600">{product.description}</p>
      </div>

      {relatedProducts.length > 0 ? (
        <div className="mt-14 border-t border-slate-200 pt-10">
          <SectionHeading title="Sản phẩm liên quan" />
          <div className="mt-6">
            <ProductGrid products={relatedProducts} />
          </div>
        </div>
      ) : null}
    </Container>
  );
}
