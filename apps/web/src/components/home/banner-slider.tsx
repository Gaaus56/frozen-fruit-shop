"use client";

import Image from "next/image";
import { useState } from "react";
import type { Banner } from "@frozen-fruit-shop/types";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

/** Banner lấy từ trang quản trị (mục Banner). Không có banner nào đang bật thì không hiển thị gì. */
export function BannerSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  if (banners.length === 0) return null;
  const hasMany = banners.length > 1;
  const go = (next: number) => setIndex((next + banners.length) % banners.length);

  return (
    <section aria-roledescription="carousel" aria-label="Banner nổi bật">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface sm:aspect-[21/8] sm:max-h-[80vh]">
        {banners.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.image}
              alt={slide.title || "Banner"}
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover transition-transform duration-[7000ms] ease-out ${
                i === index ? "scale-100" : "scale-110"
              }`}
            />
            {slide.title || slide.description ? (
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
            ) : null}
            <Container className="absolute inset-0 flex items-center">
              <div
                className={`flex max-w-xl flex-col gap-3 pl-8 text-white transition-all delay-300 duration-700 sm:pl-0 ${
                  i === index ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                {slide.title ? <h2 className="text-xl uppercase leading-tight sm:text-4xl">{slide.title}</h2> : null}
                {slide.description ? (
                  <p className="hidden text-sm text-white/85 sm:block sm:text-base">{slide.description}</p>
                ) : null}
                {slide.linkUrl ? (
                  <div>
                    <LinkButton href={slide.linkUrl}>{slide.ctaLabel || "Xem ngay"}</LinkButton>
                  </div>
                ) : null}
              </div>
            </Container>
          </div>
        ))}

        {hasMany ? (
          <>
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
              {banners.map((slide, i) => (
                <button
                  key={slide.id}
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
                    />
                  ) : null}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
