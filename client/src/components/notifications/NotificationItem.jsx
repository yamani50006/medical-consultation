import {
  BellRing,
  CheckCheck,
  MessageCircleMore,
  MessageSquareDot,
  MoveUpRight
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { formatDateTime, formatRelativeTime } from "../../utils/date";

const notificationTypeMap = {
  CHAT_MESSAGE: {
    icon: MessageCircleMore,
    label: "رسالة جديدة"
  },
  CONVERSATION_CREATED: {
    icon: MessageSquareDot,
    label: "محادثة جديدة"
  },
  MESSAGE_SEEN: {
    icon: CheckCheck,
    label: "تمت القراءة"
  }
};

export default function NotificationItem({ notification, onMarkRead }) {
  const config = notificationTypeMap[notification.type] || {
    icon: BellRing,
    label: "إشعار"
  };
  const Icon = config.icon;

  return (
    <div
      data-gsap="item"
      className={`rounded-[26px] border p-4 transition-colors duration-300 ${
        notification.isRead ? "border-border/60 bg-card/35" : "border-primary/20 bg-primary/5"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{notification.title}</p>
              <Badge variant={notification.isRead ? "secondary" : "default"}>{config.label}</Badge>
            </div>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{notification.message}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>{formatRelativeTime(notification.createdAt)}</span>
              <span>{formatDateTime(notification.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!notification.isRead ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onMarkRead(notification.id)}>
              تحديد كمقروء
            </Button>
          ) : (
            <Badge variant="secondary">مقروء</Badge>
          )}

          {notification.conversationId ? (
            <Button asChild variant="secondary" size="sm">
              <Link to={`/conversations/${notification.conversationId}`}>
                <MoveUpRight className="size-4" />
                فتح
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
