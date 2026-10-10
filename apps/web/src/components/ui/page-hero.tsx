import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * Đầu trang có ảnh nền (banner admin chọn, hoặc ảnh mặc định) + tiêu đề + bộ lọc dạng chip.
 * Dùng chung cho trang Sản phẩm và Tin tức để hai trang cùng một kiểu.
 */
export function PageHero({
  image,
  eyebrow,
  title,
  description,
  children,
}: {
  image: string;
  eyebrow: string;
  title: string;
  description?: string;
  /** Bộ lọc (FilterChips) hiện dưới tiêu đề. */
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-divider bg-[#2a2f33]">
      <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" aria-hidden />
      <Container className="relative py-12">
        <SectionHeading eyebrow={eyebrow} title={title} tone="light" description={description} />
        {children ? <div className="mt-6">{children}</div> : null}
      </Container>
    </section>
  );
}
