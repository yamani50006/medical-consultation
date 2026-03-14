import AnimatedCounter from "./AnimatedCounter";
import AnimatedCard from "./AnimatedCard";
import Badge from "../ui/Badge";

export default function DashboardWidget({
  title,
  value,
  subtitle,
  accent,
  index = 0,
  badge,
  series = []
}) {
  return (
    <AnimatedCard
      index={index}
      className="relative overflow-hidden rounded-[30px] border-white/10 bg-gradient-to-br from-card to-card/80"
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: accent || "linear-gradient(90deg, #22d3ee, #14b8a6)" }}
      />
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <AnimatedCounter
              value={value}
              className="mt-2 block font-display text-4xl font-semibold tracking-tight"
            />
          </div>
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </div>

        <div className="flex items-end gap-2">
          {series.map((item, itemIndex) => (
            <div
              key={`${title}-${itemIndex}`}
              className="animate-pulseLine rounded-full bg-gradient-to-t from-primary/30 to-accent/60"
              style={{
                height: `${item}px`,
                width: "14px",
                animationDelay: `${itemIndex * 0.12}s`
              }}
            />
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </AnimatedCard>
  );
}
