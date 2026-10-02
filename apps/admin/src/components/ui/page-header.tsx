import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: ReactNode;
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
          <h1 className="text-2xl uppercase">{title}</h1>
          {description ? <p className="mt-1 text-sm text-foreground/60">{description}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}
