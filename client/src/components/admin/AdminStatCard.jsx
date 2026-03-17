import { Card, CardContent } from "../ui/Card";
import { formatMetric } from "../../utils/admin";
import { cn } from "../../utils/cn";

export default function AdminStatCard({ title, value, subtitle, tone = "primary", trend }) {
  return (
    <Card
      data-admin-animate="card"
      className={cn(
        "group relative overflow-hidden border-border/60 bg-card/40 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.2)]",
        tone === "danger" && "bg-[linear-gradient(180deg,hsla(var(--card),0.2),rgba(255,244,244,0.42))] dark:bg-[linear-gradient(180deg,hsla(var(--card),0.28),rgba(127,29,29,0.22))]",
        tone === "warning" && "bg-[linear-gradient(180deg,hsla(var(--card),0.2),rgba(255,248,238,0.48))] dark:bg-[linear-gradient(180deg,hsla(var(--card),0.28),rgba(120,53,15,0.22))]"
      )}
    >
      <CardContent className="relative p-6">
        <div
          className={cn(
            "absolute -left-10 top-6 h-28 w-28 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-90",
            tone === "danger" && "bg-rose-200/50",
            tone === "warning" && "bg-amber-200/60",
            tone === "primary" && "bg-cyan-200/55"
          )}
        />
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1.5 rounded-t-[28px] bg-gradient-to-l",
            tone === "danger" && "from-red-500 to-rose-400",
            tone === "warning" && "from-amber-500 to-orange-400",
            tone === "primary" && "from-cyan-500 to-teal-500"
          )}
        />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground/75">{title}</p>
            <p className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">{formatMetric(value)}</p>
            {subtitle ? <p className="mt-2 max-w-[16rem] text-xs leading-6 text-muted-foreground">{subtitle}</p> : null}
          </div>
          {trend ? (
            <div className="rounded-2xl border border-white/25 bg-white/35 px-3 py-2 text-xs font-semibold text-primary shadow-sm dark:border-white/10 dark:bg-white/5">
              {trend}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
