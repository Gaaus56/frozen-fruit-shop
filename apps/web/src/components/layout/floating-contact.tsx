"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { business } from "@/data/business";

const PHONE = business.phone;

const CONTACTS: { key: string; label: string; href: string; color: string; icon: ReactNode; external?: boolean }[] = [
  {
    key: "messenger",
    label: "Messenger",
    href: business.messengerUrl,
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
    href: `https://zalo.me/${PHONE}`,
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
    href: `sms:${PHONE}`,
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
    href: `tel:${PHONE}`,
    color: "#4cb824",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.25 1z" />
      </svg>
    ),
  },
];

const CYCLE: { key: string; icon: ReactNode; label?: string; duration: number }[] = CONTACTS.map((contact) => ({
  key: contact.key,
  icon: contact.icon,
  duration: 2000,
}));

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setActiveIndex((index) => (index + 1) % CYCLE.length),
      CYCLE[activeIndex].duration,
    );
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

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
      className="fixed bottom-[0.85rem] left-1/2 z-50 isolate flex -translate-x-1/2 flex-col items-center gap-3 lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0 lg:items-end"
    >
      {isOpen ? (
        <ul className="w-56 bg-background p-2 shadow-2xl ring-1 ring-divider" role="menu">
          {CONTACTS.map((contact) => (
            <li key={contact.key} role="none">
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
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Đóng danh sách liên hệ" : "Liên hệ"}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-accent-700 text-white shadow-lg shadow-black/30 transition-colors max-lg:ring-4 max-lg:ring-background hover:bg-accent-800 lg:h-16 lg:w-16 ${
          isOpen ? "" : "contact-pulse"
        }`}
      >
        {CYCLE.map((item, index) => (
          <span
            key={item.key}
            aria-hidden
            className={`absolute inset-0 flex flex-col items-center justify-center gap-0.5 transition-opacity duration-500 [&>svg]:h-7 [&>svg]:w-7 ${
              !isOpen && index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {item.icon}
            {item.label ? <span className="text-[10px] font-extrabold leading-none">{item.label}</span> : null}
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
