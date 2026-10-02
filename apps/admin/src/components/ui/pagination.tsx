import Link from "next/link";

/** Phân trang giữ nguyên các bộ lọc khác trên URL. */
export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  params,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const href = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
    if (target > 1) search.set("page", String(target));
    const text = search.toString();
    return text ? `${basePath}?${text}` : basePath;
  };

  const link = "border border-divider bg-surface px-3 py-1.5 text-sm font-semibold hover:border-accent-600";
  return (
    <nav className="mt-4 flex items-center justify-between gap-3 text-sm" aria-label="Phân trang">
      <span className="text-foreground/60">
        Trang {page}/{pages} · {total} mục
      </span>
      <span className="flex gap-2">
        {page > 1 ? <Link href={href(page - 1)} className={link}>← Trước</Link> : null}
        {page < pages ? <Link href={href(page + 1)} className={link}>Sau →</Link> : null}
      </span>
    </nav>
  );
}
