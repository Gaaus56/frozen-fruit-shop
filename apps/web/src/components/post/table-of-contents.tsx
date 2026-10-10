"use client";

import { useState, type MouseEvent } from "react";
import type { Heading } from "@/lib/rich-headings";

/** h2 → "1.", "2."…; h3 → "1.1.", "1.2."… (h3 đứng trước mọi h2 coi như mục cấp 1). */
function numberHeadings(headings: Heading[]) {
  const result: (Heading & { number: string; nested: boolean })[] = [];
  let major = 0;
  let minor = 0;
  for (const heading of headings) {
    if (heading.level === 2 || major === 0) {
      major += 1;
      minor = 0;
      result.push({ ...heading, number: `${major}.`, nested: false });
    } else {
      minor += 1;
      result.push({ ...heading, number: `${major}.${minor}.`, nested: true });
    }
  }
  return result;
}

/**
 * Mục lục bài viết từ các tiêu đề (h2 → 1, 2, 3…; h3 → 1.1, 1.2… lùi vào). Bấm để cuộn mượt tới mục;
 * nút bên phải thu gọn / mở lại danh sách.
 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(true);

  const items = numberHeadings(headings);

  function jump(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav aria-label="Mục lục bài viết" className="mt-8 w-fit max-w-full rounded-xl bg-background px-5 py-4 ring-1 ring-divider/70">
      <div className="flex items-center justify-between gap-6">
        <p className="text-base font-extrabold text-foreground">Nội dung:</p>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="toc-list"
          title={open ? "Thu gọn mục lục" : "Mở mục lục"}
          className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-foreground/60 ring-1 ring-divider transition-colors hover:text-leaf hover:ring-leaf/50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
          </svg>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            aria-hidden
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {open ? (
        <ol id="toc-list" className="mt-3 space-y-1.5 text-[15px]">
          {items.map((item) => (
            <li key={item.id} className={item.nested ? "pl-5 text-sm" : ""}>
              <a
                href={`#${item.id}`}
                onClick={(event) => jump(event, item.id)}
                className={`flex gap-1.5 transition-colors hover:text-accent-700 ${item.nested ? "text-foreground/70" : "font-semibold text-foreground/85"}`}
              >
                <span className="shrink-0 tabular-nums">{item.number}</span>
                <span>{item.text}</span>
              </a>
            </li>
          ))}
        </ol>
      ) : null}
    </nav>
  );
}
