import type { ReactNode } from "react";

type Tone = "neutral" | "green" | "red" | "amber" | "blue";

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-foreground/70",
  green: "bg-leaf-50 text-leaf-700",
  red: "bg-accent-100 text-accent-700",
  amber: "bg-amber-50 text-amber-800",
  blue: "bg-sky-50 text-sky-800",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export const ORDER_STATUS_TONE = {
  pending: "amber",
  confirmed: "blue",
  packing: "blue",
  shipping: "blue",
  delivered: "green",
  cancelled: "red",
} as const;

export const STOCK_TONE = { in_stock: "green", low_stock: "amber", out_of_stock: "red" } as const;
