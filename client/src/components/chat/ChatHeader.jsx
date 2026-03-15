import { ArrowRight, FileStack, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileAvatar from "../shared/ProfileAvatar";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import OnlineStatusBadge from "./OnlineStatusBadge";

export default function ChatHeader({ conversation }) {
  const counterpart = conversation?.counterpart;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/conversations">
            <ArrowRight className="size-4" />
            العودة
          </Link>
        </Button>
        <ProfileAvatar
          src={counterpart?.profileImageUrl}
          name={counterpart?.fullName}
          className="size-12"
          fallbackClassName="font-semibold"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold">{counterpart?.fullName || "المحادثة"}</h2>
            {counterpart?.specialization ? <Badge>{counterpart.specialization}</Badge> : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <OnlineStatusBadge presence={counterpart?.presence} />
            {conversation?.consultation?.subject ? (
              <span className="text-xs text-muted-foreground">الاستشارة: {conversation.consultation.subject}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-2">
          <ShieldCheck className="size-4 text-primary" />
          محادثة خاصة وآمنة
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-2">
          <FileStack className="size-4 text-primary" />
          تدعم الملفات الطبية
        </span>
      </div>
    </div>
  );
}
