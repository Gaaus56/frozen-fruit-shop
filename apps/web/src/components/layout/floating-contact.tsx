"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { SiteSettings } from "@frozen-fruit-shop/types";

interface ContactChannel {
  key: string;
  label: string;
  href: string;
  color: string;
  icon: ReactNode;
  external?: boolean;
}

function buildContacts(settings: SiteSettings): ContactChannel[] {
  const phone = settings.phone.replace(/\D/g, "");
  const zalo = (settings.zaloPhone || settings.phone).replace(/\D/g, "");
  const channels: ContactChannel[] = [
    {
      key: "messenger",
      label: "Messenger",
      href: settings.facebookUrl,
      color: "#0084ff",
      external: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.5 2 2 6.2 2 11.5c0 2.9 1.3 5.4 3.4 7.1V22l3.1-1.7c1.1.3 2.3.5 3.5.5 5.5 0 10-4.2 10-9.5S17.5 2 12 2zm1 12.7-2.5-2.6-4.9 2.6 5.4-5.7 2.6 2.6 4.8-2.6-5.4 5.7z" />
        </svg>
      ),
    },
    {
      key: "zalo",
      label: "Zalo Shop",
      href: `https://zalo.me/${zalo}`,
      color: "#0068ff",
      external: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M5 3.5h14A2.5 2.5 0 0 1 21.5 6v9a2.5 2.5 0 0 1-2.5 2.5h-6.2L8 21v-3.5H5A2.5 2.5 0 0 1 2.5 15V6A2.5 2.5 0 0 1 5 3.5z" />
          <text x="12" y="13.4" textAnchor="middle" fontSize="6.6" fontWeight="800" fill="currentColor" stroke="none" fontFamily="Arial, sans-serif">
            Zalo
          </text>
        </svg>
      ),
    },
    {
      key: "sms",
      label: "SMS",
      href: `sms:${phone}`,
      color: "#1a9fc4",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z" />
          <circle cx="8.5" cy="11.5" r=".6" fill="currentColor" />
          <circle cx="12" cy="11.5" r=".6" fill="currentColor" />
          <circle cx="15.5" cy="11.5" r=".6" fill="currentColor" />
        </svg>
      ),
    },
    {
      key: "phone",
      label: "Gọi ngay",
      href: `tel:${phone}`,
      color: "#4cb824",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.25 1z" />
        </svg>
      ),
    },
  ];
  // Ẩn kênh Facebook khi cửa hàng chưa cài link.
  return channels.filter((channel) => channel.key !== "messenger" || Boolean(settings.facebookUrl));
}

const CYCLE_DURATION_MS = 2000;

export function FloatingContact({ settings }: { settings: SiteSettings }) {
  const contacts = useMemo(() => buildContacts(settings), [settings]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setActiveIndex((index) => (index + 1) % contacts.length),
      CYCLE_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [activeIndex, contacts.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed bottom-[0.85rem] left-1/2 z-50 isolate flex -translate-x-1/2 flex-col items-center gap-3 lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0 lg:items-end"
    >
      {/* Luôn render để có hiệu ứng cả lúc mở lẫn lúc đóng (xem .contact-menu trong globals.css);
          khi đóng thì `inert` để không bấm / Tab vào được. Khung ngoài pointer-events-none để phần
          trống không chặn cú bấm vào thanh điều hướng phía sau. */}
      <ul
        className="contact-menu pointer-events-auto w-56 bg-card p-2 shadow-2xl ring-1 ring-divider"
        role="menu"
        data-open={isOpen}
        inert={!isOpen}
        aria-hidden={!isOpen}
      >
        {contacts.map((contact, index) => (
          <li key={contact.key} role="none" style={{ "--i": contacts.length - 1 - index } as CSSProperties}>
            <a
              role="menuitem"
              href={contact.href}
              {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-center gap-3 px-2 py-2 text-sm font-semibold text-foreground hover:bg-surface"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white [&>svg]:h-5 [&>svg]:w-5"
                style={{ background: contact.color }}
              >
                {contact.icon}
              </span>
              {contact.label}
            </a>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Đóng danh sách liên hệ" : "Liên hệ"}
        className={`pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-accent-700 text-white shadow-lg shadow-black/30 transition-colors max-lg:ring-4 max-lg:ring-background hover:bg-accent-800 lg:h-16 lg:w-16 ${
          isOpen ? "" : "contact-pulse"
        }`}
      >
        {contacts.map((item, index) => (
          <span
            key={item.key}
            aria-hidden
            className={`absolute inset-0 flex flex-col items-center justify-center gap-0.5 transition-opacity duration-500 [&>svg]:h-7 [&>svg]:w-7 ${
              !isOpen && index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {item.icon}
          </span>
        ))}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={`absolute h-6 w-6 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
