import { ChevronLeft, MapPin, MessageCircleMore, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileAvatar from "../shared/ProfileAvatar";
import Badge from "../ui/Badge";
import { formatRelativeTime } from "../../utils/date";
import OnlineStatusBadge from "./OnlineStatusBadge";
import { cn } from "../../utils/cn";

export default function ConversationCard({ conversation, active = false }) {
  return (
    <Link
      to={`/conversations/${conversation.id}`}
      className={cn(
        "group block rounded-[28px] border p-5 transition-all duration-300",
        active
          ? "border-primary/30 bg-primary/5 shadow-card"
          : "border-border/60 bg-card/45 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card/70"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <ProfileAvatar
            src={conversation.counterpart?.profileImageUrl}
            name={conversation.counterpart?.fullName}
            className="size-14"
            fallbackClassName="font-semibold"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-semibold">{conversation.counterpart?.fullName || "طرف المحادثة"}</p>
              {conversation.unreadCount ? <Badge>{conversation.unreadCount} جديد</Badge> : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {conversation.counterpart?.specialization ? (
                <span className="inline-flex items-center gap-1">
                  <Stethoscope className="size-3.5" />
                  {conversation.counterpart.specialization}
                </span>
              ) : null}
              {conversation.counterpart?.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {conversation.counterpart.location}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="shrink-0 text-left">
          <p className="text-xs text-muted-foreground">
            {conversation.lastMessageAt ? formatRelativeTime(conversation.lastMessageAt) : "الآن"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <OnlineStatusBadge presence={conversation.counterpart?.presence} showLastSeen={false} />
        {conversation.consultation?.subject ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1 text-xs text-muted-foreground">
            <MessageCircleMore className="size-3.5" />
            {conversation.consultation.subject}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="line-clamp-2 min-h-12 flex-1 text-sm leading-6 text-muted-foreground">
          {conversation.lastMessage?.preview || "ابدأ المحادثة الآن."}
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform duration-300 group-hover:-translate-x-1">
          دخول
          <ChevronLeft className="size-4" />
        </span>
      </div>
    </Link>
  );
}
