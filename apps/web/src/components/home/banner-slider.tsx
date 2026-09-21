"use client";

import Image from "next/image";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

const SLIDES = [
  {
    src: "/images/banners/banner_v1.jpg",
    title: "Trái cây đông lạnh tươi mát quanh năm",
    description: "Cam, dâu, việt quất... cấp đông ngay sau thu hoạch, mở túi là dùng.",
    href: "/products",
    cta: "Xem sản phẩm",
  },
  {
    src: "/images/banners/banner_v2.jpg",
    title: "Cấp đông nhanh, giữ trọn hương vị",
    description: "Không chất bảo quản, đóng gói hút chân không, giữ nguyên dinh dưỡng.",
    href: "/about",
    cta: "Tìm hiểu thêm",
  },
  {
    src: "/images/banners/banner_v3.jpg",
    title: "Sinh tố & nước ép từ trái cây đông lạnh",
    description: "Công thức nhanh gọn cho gia đình, ngon như trái cây tươi.",
    href: "/products",
    cta: "Xem sản phẩm",
  },
  {
    src: "/images/banners/banner_v4.jpg",
    title: "Nguyên liệu ổn định cho quán nước & F&B",
    description: "Giá sỉ ưu đãi, giao lạnh đúng lịch trên toàn quốc.",
    href: "/contact",
    cta: "Liên hệ báo giá",
  },
];

export function BannerSlider() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const go = (next: number) => setIndex((next + SLIDES.length) % SLIDES.length);

  return (
    <section aria-roledescription="carousel" aria-label="Banner nổi bật">
      <div
          className="relative aspect-[16/9] w-full overflow-hidden bg-surface sm:aspect-[21/8] sm:max-h-[80vh]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
              aria-hidden={i !== index}
            >
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover transition-transform duration-[7000ms] ease-out ${i === index ? "scale-100" : "scale-110"}`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
              <Container className="absolute inset-0 flex items-center">
                <div
                  className={`flex max-w-xl flex-col gap-3 pl-8 text-white transition-all duration-700 delay-300 sm:pl-0 ${
                    i === index ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  }`}
                >
                  <h2 className="text-xl uppercase leading-tight sm:text-4xl">{slide.title}</h2>
                  <p className="hidden text-sm text-white/85 sm:block sm:text-base">{slide.description}</p>
                  <div>
                    <LinkButton href={slide.href}>{slide.cta}</LinkButton>
                  </div>
                </div>
              </Container>
            </div>
          ))}

          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Banner trước"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/40 text-xl text-white hover:bg-accent-600"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Banner sau"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/40 text-xl text-white hover:bg-accent-600"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Chuyển tới banner ${i + 1}`}
                aria-current={i === index}
                className={`relative h-1.5 overflow-hidden bg-white/60 transition-all duration-500 hover:bg-white ${
                  i === index ? "w-10" : "w-4"
                }`}
              >
                {i === index ? (
                  <span
                    key={index}
                    className="banner-progress absolute inset-y-0 left-0 bg-accent-600"
                    onAnimationEnd={() => go(index + 1)}
                    style={{ animationPlayState: isPaused ? "paused" : "running" }}
                  />
                ) : null}
              </button>
            ))}
          </div>
      </div>
    </section>
  );
}
