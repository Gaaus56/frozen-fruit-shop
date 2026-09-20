import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Thanh toán",
};

export default function CheckoutPage() {
  return (
    <Container className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-5xl" aria-hidden>🚧</p>
      <h1 className="text-2xl font-semibold text-foreground">Tính năng thanh toán đang được hoàn thiện</h1>
      <p className="max-w-md text-foreground/70">
        Luồng đặt hàng và thanh toán (COD, chuyển khoản, cổng thanh toán online) sẽ sớm được tích hợp.
        Trong lúc chờ, bạn có thể liên hệ trực tiếp để đặt hàng.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <LinkButton href="/lien-he">Liên hệ đặt hàng</LinkButton>
        <LinkButton href="/gio-hang" variant="secondary">Quay lại giỏ hàng</LinkButton>
      </div>
    </Container>
  );
}
