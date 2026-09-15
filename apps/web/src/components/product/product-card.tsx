import Image from "next/image";
import Link from "next/link";
import type { Product } from "@frozen-fruit-shop/types";
import { formatCurrency } from "@/lib/format";
import { StarRating } from "@/components/ui/star-rating";

export function ProductCard({ product }: { product: Product }) {
  const defaultVariant = product.variants[0];

  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
    >
      <div className="relative aspect-square w-full bg-teal-50/60">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain p-6 transition-transform group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
        {product.tags.includes("ban-chay") ? (
          <span className="absolute left-3 top-3 rounded-full bg-mango-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            Bán chạy
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-display font-medium text-slate-900">{product.name}</h3>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-display text-lg font-semibold text-mango-600">
            {formatCurrency(defaultVariant.price)}
          </span>
          <span className="text-xs text-slate-500">/ {defaultVariant.packageSize}</span>
        </div>
      </div>
    </Link>
  );
}
