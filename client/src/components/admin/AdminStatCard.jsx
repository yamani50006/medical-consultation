import { Card, CardContent } from "../ui/Card";
import { formatMetric } from "../../utils/admin";
import { cn } from "../../utils/cn";

export default function AdminStatCard({ title, value, subtitle, tone = "primary", trend }) {
  return (
    <Card
      data-admin-animate="card"
      className={cn(
        "overflow-hidden border-white/45 bg-white/80 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.32)]",
        tone === "danger" && "border-red-200/80",
        tone === "warning" && "border-amber-200/80"
      )}
    >
      <CardContent className="relative p-6">
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1.5 rounded-t-[28px] bg-gradient-to-l",
            tone === "danger" && "from-red-500 to-rose-400",
            tone === "warning" && "from-amber-500 to-orange-400",
            tone === "primary" && "from-cyan-500 to-teal-500"
          )}
        />
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-3xl font-bold text-foreground">{formatMetric(value)}</p>
            {subtitle ? <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          {trend ? (
            <div className="rounded-2xl bg-secondary/70 px-3 py-2 text-xs font-semibold text-primary">{trend}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
