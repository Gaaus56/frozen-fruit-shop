import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-accent-600">404</p>
      <h1 className="text-2xl uppercase text-foreground">Không tìm thấy trang</h1>
      <p className="max-w-md text-foreground/70">Trang bạn tìm có thể đã được đổi tên, ngừng hiển thị hoặc không tồn tại.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <LinkButton href="/">Về trang chủ</LinkButton>
        <LinkButton href="/products" variant="secondary">Xem sản phẩm</LinkButton>
      </div>
    </Container>
  );
}
