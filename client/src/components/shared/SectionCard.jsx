import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { cn } from "../../utils/cn";

export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
  badge
}) {
  return (
    <Card className={cn("rounded-[30px]", className)}>
      {(title || subtitle || action || badge) && (
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            {badge ? <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{badge}</span> : null}
            {title ? <CardTitle>{title}</CardTitle> : null}
            {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </CardHeader>
      )}
      <CardContent className={cn("space-y-4", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
