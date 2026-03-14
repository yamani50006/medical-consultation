import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "../../utils/cn";

const sizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6"
};

export default function StarRating({
  value = 0,
  max = 5,
  size = "md",
  readOnly = false,
  onChange,
  className,
  showValue = false
}) {
  const [hoveredValue, setHoveredValue] = useState(null);
  const normalizedValue = Math.max(0, Math.min(Number(value) || 0, max));
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  if (readOnly) {
    return (
      <div className={cn("inline-flex items-center gap-3", className)} style={{ direction: "ltr" }}>
        <div className="relative">
          <div className="flex items-center gap-1 text-amber-200/90 dark:text-amber-950/70">
            {stars.map((star) => (
              <Star key={star} className={cn(sizeClasses[size], "fill-current")} />
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden text-amber-500"
            style={{ width: `${(normalizedValue / max) * 100}%` }}
          >
            <div className="flex items-center gap-1">
              {stars.map((star) => (
                <Star key={star} className={cn(sizeClasses[size], "fill-current")} />
              ))}
            </div>
          </div>
        </div>
        {showValue ? <span className="text-sm font-semibold text-amber-600">{normalizedValue.toFixed(1)}</span> : null}
      </div>
    );
  }

  const activeValue = hoveredValue ?? normalizedValue;

  return (
    <div className={cn("inline-flex items-center gap-3", className)} style={{ direction: "ltr" }}>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHoveredValue(null)}
        onBlur={() => setHoveredValue(null)}
      >
        {stars.map((star) => {
          const active = star <= activeValue;

          return (
            <button
              key={star}
              type="button"
              className="rounded-full p-1 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
              onMouseEnter={() => setHoveredValue(star)}
              onFocus={() => setHoveredValue(star)}
              onClick={() => onChange?.(star)}
              aria-label={`تقييم ${star} من ${max}`}
              aria-pressed={normalizedValue === star}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-all duration-200",
                  active
                    ? "fill-amber-400 text-amber-500 drop-shadow-[0_4px_12px_rgba(245,158,11,0.28)]"
                    : "fill-transparent text-amber-300 dark:text-amber-900"
                )}
              />
            </button>
          );
        })}
      </div>

      {showValue ? (
        <span className="text-sm font-semibold text-amber-600">{normalizedValue ? `${normalizedValue}/${max}` : `0/${max}`}</span>
      ) : null}
    </div>
  );
}
