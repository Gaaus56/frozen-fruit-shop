import { Container } from "@/components/ui/container";

/** Khung chờ trang chi tiết — tránh hiện khung chờ của trang danh sách (loading.tsx cấp cha). */
export default function ProductDetailLoading() {
  return (
    <Container className="py-12" aria-busy>
      <span className="mb-6 block h-4 w-64 animate-pulse rounded-full bg-surface" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square w-full animate-pulse rounded-xl bg-surface" />
        <div className="flex flex-col gap-4">
          <span className="h-3 w-28 animate-pulse rounded-full bg-surface" />
          <span className="h-8 w-3/4 animate-pulse rounded-full bg-surface" />
          <span className="h-4 w-full animate-pulse rounded-full bg-surface" />
          <div className="mt-4 flex gap-2">
            <span className="h-10 w-20 animate-pulse rounded-lg bg-surface" />
            <span className="h-10 w-20 animate-pulse rounded-lg bg-surface" />
          </div>
          <span className="h-8 w-40 animate-pulse rounded-full bg-surface" />
          <span className="mt-2 h-11 w-full animate-pulse rounded-lg bg-surface" />
        </div>
      </div>
    </Container>
  );
}
