export function StarRating({ rating, reviewCount }: { rating: number; reviewCount?: number }) {
  const fullStars = Math.round(rating);
  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="flex text-amber-400" aria-hidden>
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index}>{index < fullStars ? "★" : "☆"}</span>
        ))}
      </span>
      <span className="text-slate-500">
        {rating.toFixed(1)}
        {typeof reviewCount === "number" ? ` (${reviewCount})` : ""}
      </span>
    </div>
  );
}
