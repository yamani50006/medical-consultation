import { BellRing } from "lucide-react";
import EmptyState from "../shared/EmptyState";
import LoadingState from "../shared/LoadingState";
import Button from "../ui/Button";
import NotificationItem from "./NotificationItem";
import { useGsapStagger } from "../../hooks/useGsapStagger";

export default function NotificationList({
  notifications,
  loading,
  error,
  hasMore,
  onLoadMore,
  onRetry,
  onMarkRead
}) {
  const scopeRef = useGsapStagger([notifications.length]);

  if (loading && !notifications.length) {
    return <LoadingState rows={5} compact />;
  }

  if (error && !notifications.length) {
    return (
      <EmptyState
        title="تعذر تحميل الإشعارات"
        description={error}
        action={
          <Button type="button" onClick={onRetry}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  }

  if (!notifications.length) {
    return (
      <EmptyState
        title="لا توجد إشعارات حتى الآن"
        description="ستظهر هنا التنبيهات الخاصة بالرسائل الجديدة وفتح المحادثات وأي تحديثات لاحقة داخل التطبيق."
        icon={BellRing}
      />
    );
  }

  return (
    <div ref={scopeRef} className="space-y-4">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onMarkRead={onMarkRead} />
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
