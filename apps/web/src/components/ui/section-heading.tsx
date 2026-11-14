export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "default",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: "default" | "light";
  /** "h1" cho tiêu đề chính của trang (mỗi trang đúng một h1); mặc định h2 cho tiêu đề khối. */
  as?: "h1" | "h2";
}) {
  const isLight = tone === "light";
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className={`text-[13px] font-bold uppercase tracking-[0.08em] ${isLight ? "text-accent-400" : "text-accent-600"}`}>{eyebrow}</p>
      ) : null}
      <Tag className={`mt-3 text-2xl uppercase tracking-tight text-balance sm:text-3xl ${isLight ? "text-white" : "text-foreground"}`}>{title}</Tag>
      {description ? <p className={`mt-2 ${isLight ? "text-white/80" : "text-foreground/70"}`}>{description}</p> : null}
    </div>
  );
}
