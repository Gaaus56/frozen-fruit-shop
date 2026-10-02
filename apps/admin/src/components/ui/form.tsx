import type { ReactNode } from "react";

export const inputClass =
  "mt-1 w-full border border-divider bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-accent-600 focus:outline-none disabled:bg-muted";

export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground/85">
        {label}
        {required ? <span className="text-accent-600"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-foreground/55">{hint}</p> : null}
    </div>
  );
}

export function Checkbox({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 accent-[#ec3013]" />
      <span>
        <span className="font-semibold text-foreground/85">{label}</span>
        {hint ? <span className="block text-xs text-foreground/55">{hint}</span> : null}
      </span>
    </label>
  );
}

export function FormAlert({ state }: { state: { error?: string; success?: string } | undefined }) {
  if (state?.error) {
    return (
      <p role="alert" className="border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-700">
        {state.error}
      </p>
    );
  }
  if (state?.success) {
    return (
      <p role="status" className="border border-leaf-100 bg-leaf-50 px-4 py-3 text-sm font-semibold text-leaf-700">
        {state.success}
      </p>
    );
  }
  return null;
}

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="border border-divider bg-surface p-5">
      <h2 className="text-base">{title}</h2>
      {description ? <p className="mt-1 text-sm text-foreground/60">{description}</p> : null}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}
