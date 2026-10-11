"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Khung bọc một khối trên trang chủ (danh mục, sản phẩm, tin tức...) giống một "bài viết" —
 * nền trắng bo góc. Tiêu đề căn giữa, bên dưới là một đường kẻ hoa văn nhỏ (không khung, không viền).
 * `action` (nếu có) hiện thành nút bo tròn căn giữa bên dưới. Hiện mờ dần + trượt lên khi lướt tới.
 */
export function SectionCard({
  title,
  action,
  children,
  className = "",
}: {
  /** Để trống thì không có dòng tiêu đề + hoa văn (khối trang chủ không tiêu đề). */
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  // Người dùng tắt hiệu ứng chuyển động: hiện sẵn, không cần quan sát cuộn.
  const [isVisible, setIsVisible] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (isVisible) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.01, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <section
      ref={ref}
      className={`rounded-2xl border border-divider bg-card px-4 pb-4 pt-3 shadow-sm transition-all duration-700 ease-out sm:px-7 sm:pb-7 sm:pt-5 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {title ? <SectionTitle title={title} /> : null}

      {children}

      {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
    </section>
  );
}

/** Tiêu đề căn giữa chữ đỏ in hoa + đường kẻ hoa văn — dùng chung cho khung và khối không khung ở trang chủ. */
export function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-xl font-extrabold uppercase tracking-wide text-accent-700 sm:text-2xl">{title}</h2>
      <div className="mt-1 flex items-center justify-center gap-2.5" aria-hidden>
        <span className="h-1 w-1 shrink-0 rotate-45 bg-leaf/60" />
        <span
          className="h-px w-14 sm:w-24"
          style={{ background: "linear-gradient(to right, transparent, var(--leaf) 92%)" }}
        />
        <span className="h-2 w-2 shrink-0 rotate-45 bg-leaf" />
        <span
          className="h-px w-14 sm:w-24"
          style={{ background: "linear-gradient(to left, transparent, var(--leaf) 92%)" }}
        />
        <span className="h-1 w-1 shrink-0 rotate-45 bg-leaf/60" />
      </div>
    </div>
  );
}
