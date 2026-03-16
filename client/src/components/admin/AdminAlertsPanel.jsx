import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { formatAlertSeverity } from "../../utils/admin";
import { formatDateTime } from "../../utils/date";
import { formatStatus, getStatusBadgeVariant } from "../../utils/status";

export default function AdminAlertsPanel({ alerts, compact = false, onStatusChange }) {
  return (
    <Card className="border-white/40 bg-white/80">
      <CardHeader>
        <CardTitle>التنبيهات التشغيلية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
            لا توجد تنبيهات نشطة حاليًا.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              data-admin-animate="alert"
              className="rounded-[24px] border border-border/70 bg-secondary/35 p-4 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(alert.severity)}>{formatAlertSeverity(alert.severity)}</Badge>
                    <Badge variant={getStatusBadgeVariant(alert.status)}>{formatStatus(alert.status)}</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{alert.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">{alert.message}</p>
                  <div className="text-xs text-muted-foreground">
                    {alert.targetDoctor?.user?.fullName ? `الجهة: ${alert.targetDoctor.user.fullName} • ` : ""}
                    {formatDateTime(alert.createdAt)}
                  </div>
                </div>
                {compact ? null : (
                  <div className="flex flex-wrap gap-2">
                    {alert.status !== "REVIEWING" ? (
                      <Button type="button" size="sm" variant="secondary" onClick={() => onStatusChange(alert.id, "reviewing")}>
                        قيد المراجعة
                      </Button>
                    ) : null}
                    {alert.status !== "RESOLVED" ? (
                      <Button type="button" size="sm" variant="primary" onClick={() => onStatusChange(alert.id, "resolved")}>
                        تم الحل
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
