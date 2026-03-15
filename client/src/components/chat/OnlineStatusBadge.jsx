import Badge from "../ui/Badge";
import { formatRelativeTime } from "../../utils/date";

export default function OnlineStatusBadge({ presence, showLastSeen = true }) {
  const status = presence?.status || "OFFLINE";
  const isOnline = status === "ONLINE";

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`size-2.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
      <Badge variant={isOnline ? "success" : "secondary"}>
        {isOnline ? "متصل الآن" : "غير متصل"}
      </Badge>
      {!isOnline && showLastSeen && presence?.lastSeenAt ? (
        <span className="text-xs text-muted-foreground">آخر ظهور {formatRelativeTime(presence.lastSeenAt)}</span>
      ) : null}
    </div>
  );
}
