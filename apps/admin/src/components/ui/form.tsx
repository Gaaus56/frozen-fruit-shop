import type { ReactNode } from "react";
import { WithHelp } from "./help";

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
    <WithHelp
      className={className}
      label={label}
      help={hint}
      placement="bottom"
      helpClassName="text-xs"
      head={
        <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground/85">
          {label}
          {required ? <span className="text-accent-600"> *</span> : null}
        </label>
      }
    >
      {children}
    </WithHelp>
  );
}

export function Checkbox({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <WithHelp
      label={label}
      help={hint}
      helpClassName="text-xs"
      head={
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[#ec3013]" />
          <span className="font-semibold text-foreground/85">{label}</span>
        </label>
      }
    />
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

export function Section({ id, title, description, children }: { id?: string; title: string; description?: ReactNode; children: ReactNode }) {
  return (
    // scroll-mt: nhảy tới bằng #id (từ trang Xem trước & sửa) không bị che bởi mép trên.
    <section id={id} className="scroll-mt-6 border border-divider bg-surface p-5 target:ring-2 target:ring-accent-600">
      <WithHelp head={<h2 className="text-base">{title}</h2>} help={description} label={title} />
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}
