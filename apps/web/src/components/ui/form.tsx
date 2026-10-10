import type { ReactNode } from "react";

export const inputClass =
  "mt-1 w-full border border-divider bg-background px-3 py-2 text-sm text-foreground focus:border-accent-500 focus:outline-none disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground/85">
        {label}
        {required ? <span className="text-accent-600"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-foreground/65">{hint}</p> : null}
    </div>
  );
}

/** Ô ẩn bẫy bot: người dùng thật không thấy nên để trống; bot tự điền thì API bỏ qua yêu cầu. */
export function HoneypotField() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          : "border border-accent-200 bg-accent-50 p-6 text-accent-800"
      }
    >
      {children}
    </div>
  );
}
