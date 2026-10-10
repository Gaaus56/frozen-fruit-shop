import { formatCurrency } from "@/lib/format";

/** Giá bán, kèm giá gốc gạch ngang và % giảm khi có khuyến mãi. */
export function Price({
  price,
  compareAtPrice,
  size = "md",
}: {
  price: number;
  compareAtPrice: number | null;
  size?: "md" | "lg";
}) {
  const discount = compareAtPrice && compareAtPrice > price ? Math.round((1 - price / compareAtPrice) * 100) : 0;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className={`font-extrabold text-price ${size === "lg" ? "text-2xl" : "text-lg"}`}>{formatCurrency(price)}</span>
      {discount > 0 ? (
        <>
          <span className="text-sm text-foreground/65 line-through">{formatCurrency(compareAtPrice!)}</span>
          <span className="bg-accent-100 px-1.5 py-0.5 text-[11px] font-extrabold text-accent-700">-{discount}%</span>
        </>
      ) : null}
    </span>
  );
}
