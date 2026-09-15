import Image from "next/image";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-teal-50/70 via-background to-background">
      <Container className="grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-wide text-teal-600">
            <span className="h-px w-5 bg-teal-600/50" aria-hidden />
            Cấp đông ở −35°C trong 2 giờ
          </p>
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold leading-[1.08] text-slate-900 sm:text-5xl lg:text-[3.4rem]">
            Trái cây chín tới,{" "}
            <span className="text-mango-600">đông lạnh</span> giữ trọn vị.
          </h1>
          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-slate-600">
            Cấp đông nhanh ngay sau thu hoạch, không chất bảo quản, đóng gói hút chân không giữ trọn
            hương vị — giao hàng lạnh tận nơi trên toàn quốc.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/san-pham">Khám phá sản phẩm</LinkButton>
            <LinkButton href="/gioi-thieu" variant="secondary">
              Tìm hiểu về chúng tôi
            </LinkButton>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div
            className="absolute inset-0 rounded-[28px]"
            style={{
              background:
                "radial-gradient(circle at 28% 24%, color-mix(in srgb, var(--color-teal-500) 22%, transparent), transparent 58%), radial-gradient(circle at 78% 82%, color-mix(in srgb, var(--color-mango-500) 18%, transparent), transparent 60%)",
            }}
            aria-hidden
          />
          <Image
            src="/images/hero-fruit.svg"
            alt="Trái cây đông lạnh"
            fill
            className="object-contain p-4"
            sizes="(min-width: 1024px) 448px, 90vw"
            priority
          />
        </div>
      </Container>
    </section>
  );
}
