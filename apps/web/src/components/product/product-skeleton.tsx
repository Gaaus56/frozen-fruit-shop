/** Khung chờ cùng kích thước với ProductCard — hiện khi đang tải danh sách sản phẩm. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-divider/70" aria-hidden>
      <div className="aspect-square w-full animate-pulse bg-surface" />
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <span className="h-2.5 w-16 animate-pulse rounded-full bg-surface" />
        <span className="h-3.5 w-4/5 animate-pulse rounded-full bg-surface" />
        <div className="mt-2 flex items-center justify-between">
          <span className="h-4 w-20 animate-pulse rounded-full bg-surface" />
          <span className="h-7 w-7 animate-pulse rounded-lg bg-surface sm:h-8 sm:w-8" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4" role="status" aria-label="Đang tải sản phẩm">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
