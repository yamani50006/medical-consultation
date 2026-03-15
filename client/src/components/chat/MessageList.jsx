import { useEffect, useRef } from "react";
import { MessageCircleMore } from "lucide-react";
import EmptyState from "../shared/EmptyState";
import LoadingState from "../shared/LoadingState";
import Button from "../ui/Button";
import MessageBubble from "./MessageBubble";
import { useGsapStagger } from "../../hooks/useGsapStagger";

export default function MessageList({ messages, loading, loadingMore, onLoadOlder, hasMore }) {
  const scopeRef = useGsapStagger([messages.length]);
  const bottomRef = useRef(null);
  const lastMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      block: "end"
    });
  }, [lastMessageId]);

  if (loading && !messages.length) {
    return <LoadingState rows={5} />;
  }

  if (!messages.length) {
    return (
      <EmptyState
        title="لا توجد رسائل بعد"
        description="أرسل أول رسالة لبدء المتابعة الطبية بشكل مباشر داخل المنصة."
        icon={MessageCircleMore}
      />
    );
  }

  return (
    <div className="space-y-4">
      {hasMore ? (
        <div className="text-center">
          <Button type="button" variant="secondary" onClick={onLoadOlder} disabled={loadingMore}>
            {loadingMore ? "جارٍ التحميل..." : "تحميل الرسائل الأقدم"}
          </Button>
        </div>
      ) : null}

      <div ref={scopeRef} className="space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
