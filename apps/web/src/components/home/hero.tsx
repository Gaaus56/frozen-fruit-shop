import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

export function Hero() {
  return (
    <section>
      <Container className="py-16 lg:py-24">
        <div>
          <span className="inline-flex bg-accent-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-800">
            Trái cây đông lạnh chuẩn VietGAP
          </span>
          <h1 className="mt-4 text-balance text-4xl uppercase leading-[1.08] text-foreground sm:text-5xl lg:text-[3.4rem]">
            Tươi tự nhiên. <span className="text-accent-600">Đông lạnh</span> đúng cách.
          </h1>
          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-foreground/70">
            Cấp đông nhanh ngay sau thu hoạch, không chất bảo quản, đóng gói hút chân không giữ trọn
            hương vị — giao hàng lạnh tận nơi trên toàn quốc.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/products">Khám phá sản phẩm</LinkButton>
            <LinkButton href="/about" variant="secondary">
              Tìm hiểu về chúng tôi
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
