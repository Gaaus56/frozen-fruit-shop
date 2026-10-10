import { Container } from "@/components/ui/container";
import { ProductGridSkeleton } from "@/components/product/product-skeleton";

/** Hiện ngay khi khách đổi danh mục / sắp xếp / tìm kiếm, trong lúc server lấy dữ liệu. */
export default function ProductsLoading() {
  return (
    <>
      <section className="border-b border-divider bg-[#2a2f33]">
        <Container className="py-12">
          <span className="block h-3 w-20 animate-pulse rounded-full bg-white/20" />
          <span className="mt-4 block h-8 w-72 max-w-full animate-pulse rounded-full bg-white/20" />
          <span className="mt-3 block h-4 w-96 max-w-full animate-pulse rounded-full bg-white/15" />
          <div className="mt-6 flex flex-wrap gap-2">
            {[64, 120, 112, 140].map((width) => (
              <span key={width} className="h-9 animate-pulse rounded-full bg-white/15" style={{ width }} />
            ))}
          </div>
        </Container>
      </section>
      <section className="pb-12 pt-6 sm:pt-8">
        <Container>
          <span className="mb-6 block h-7 w-80 max-w-full animate-pulse rounded-full bg-surface" />
          <ProductGridSkeleton />
        </Container>
      </section>
    </>
  );
}
