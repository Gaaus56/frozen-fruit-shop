export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: "default" | "light";
}) {
  const isLight = tone === "light";
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className={`text-[13px] font-bold uppercase tracking-[0.08em] ${isLight ? "text-accent-400" : "text-accent-600"}`}>{eyebrow}</p>
      ) : null}
      <h2 className={`mt-3 text-2xl uppercase tracking-tight text-balance sm:text-3xl ${isLight ? "text-white" : "text-foreground"}`}>{title}</h2>
      {description ? <p className={`mt-2 ${isLight ? "text-white/80" : "text-foreground/70"}`}>{description}</p> : null}
    </div>
  );
}
