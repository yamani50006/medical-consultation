import { MessageCircleMore } from "lucide-react";
import EmptyState from "../shared/EmptyState";
import LoadingState from "../shared/LoadingState";
import Button from "../ui/Button";
import ConversationCard from "./ConversationCard";
import { useGsapStagger } from "../../hooks/useGsapStagger";

export default function ConversationList({
  conversations,
  loading,
  error,
  activeConversationId,
  onRetry,
  onLoadMore,
  hasMore
}) {
  const scopeRef = useGsapStagger([conversations.length, activeConversationId]);

  if (loading && !conversations.length) {
    return <LoadingState rows={4} />;
  }

  if (error && !conversations.length) {
    return (
      <EmptyState
        title="تعذر تحميل المحادثات"
        description={error}
        action={
          <Button type="button" onClick={onRetry}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  }

  if (!conversations.length) {
    return (
      <EmptyState
        title="لا توجد محادثات حتى الآن"
        description="سيتم إنشاء المحادثات المرتبطة بالاستشارات هنا بمجرد فتح أول جلسة دردشة بين الطبيب والمريض."
        icon={MessageCircleMore}
      />
    );
  }

  return (
    <div ref={scopeRef} className="space-y-4">
      {conversations.map((conversation) => (
        <div key={conversation.id} data-gsap="item">
          <ConversationCard conversation={conversation} active={activeConversationId === conversation.id} />
        </div>
      ))}

      {hasMore ? (
        <div className="pt-2 text-center">
          <Button type="button" variant="secondary" onClick={onLoadMore} disabled={loading}>
            تحميل المزيد
          </Button>
        </div>
      ) : null}
    </div>
  );
}
