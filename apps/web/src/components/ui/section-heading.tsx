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
        <p className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-wide text-teal-600">
          <span className="h-px w-5 bg-teal-600/50" aria-hidden />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 text-balance sm:text-3xl">
        {title}
      </h2>
      {description ? <p className="mt-2 text-slate-600">{description}</p> : null}
    </div>
  );
}
