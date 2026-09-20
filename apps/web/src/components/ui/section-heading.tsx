export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-accent-600">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 text-2xl uppercase tracking-tight text-foreground text-balance sm:text-3xl">{title}</h2>
      {description ? <p className="mt-2 text-foreground/70">{description}</p> : null}
    </div>
  );
}
