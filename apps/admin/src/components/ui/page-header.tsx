import Link from "next/link";
import type { ReactNode } from "react";
import { WithHelp } from "./help";

export function PageHeader({
  title,
  description,
  help,
  action,
  back,
}: {
  title: string;
  /** Số liệu ngắn luôn hiện (ngày đặt, số sản phẩm…). */
  description?: ReactNode;
  /** Giải thích về trang: ẩn sau nút "?" cạnh tiêu đề. */
  help?: ReactNode;
  action?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back ? (
        <Link href={back.href} className="text-sm font-semibold text-foreground/55 hover:text-accent-700">
          ← {back.label}
        </Link>
      ) : null}
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div>
          <WithHelp head={<h1 className="text-2xl uppercase">{title}</h1>} help={help} label={title} helpClassName="max-w-2xl text-sm" />
          {description ? <p className="mt-1 text-sm text-foreground/60">{description}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}
