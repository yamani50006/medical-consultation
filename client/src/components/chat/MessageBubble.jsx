import { Check, CheckCheck } from "lucide-react";
import AttachmentPreview from "./AttachmentPreview";
import { formatTime } from "../../utils/date";
import { cn } from "../../utils/cn";

function MessageStatus({ status }) {
  if (status === "SEEN") {
    return (
      <span className="inline-flex items-center gap-1 text-primary">
        <CheckCheck className="size-3.5" />
        شوهدت
      </span>
    );
  }

  if (status === "DELIVERED") {
    return (
      <span className="inline-flex items-center gap-1">
        <CheckCheck className="size-3.5" />
        وصلت
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Check className="size-3.5" />
      أرسلت
    </span>
  );
}

export default function MessageBubble({ message }) {
  return (
    <div className={cn("flex", message.isOwnMessage ? "justify-start" : "justify-end")} data-gsap="item">
      <div className={cn("max-w-[min(100%,42rem)] space-y-2", message.isOwnMessage ? "items-start" : "items-end")}>
        {(message.body || message.attachments?.length) && (
          <div
            className={cn(
              "rounded-[24px] px-4 py-3 shadow-sm",
              message.isOwnMessage
                ? "rounded-tr-md bg-primary text-primary-foreground"
                : "rounded-tl-md border border-border/60 bg-card/85 text-foreground"
            )}
          >
            {message.body ? <p className="whitespace-pre-wrap text-sm leading-7">{message.body}</p> : null}

            {message.attachments?.length ? (
              <div className="mt-3 space-y-3">
                {message.attachments.map((attachment) => (
                  <AttachmentPreview
                    key={attachment.id}
                    attachment={attachment}
                    compact
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}

        <div
          className={cn(
            "flex items-center gap-2 px-1 text-[11px]",
            message.isOwnMessage ? "justify-start text-primary/80" : "justify-end text-muted-foreground"
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {message.isOwnMessage ? <MessageStatus status={message.status} /> : null}
        </div>
      </div>
    </div>
  );
}
