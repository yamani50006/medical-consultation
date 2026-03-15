import { Bell, CheckCheck } from "lucide-react";
import NotificationList from "../components/notifications/NotificationList";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import Button from "../components/ui/Button";
import { useNotificationsCenter } from "../features/notifications/useNotificationsCenter";

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
        active
          ? "bg-primary text-primary-foreground shadow-glow"
          : "bg-secondary/70 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export default function NotificationsPage() {
  const { notifications, meta, loading, error, filter, setFilter, refresh, markAsRead, markAllRead, loadMore } =
    useNotificationsCenter();

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Notification Center"
        title="الإشعارات"
        subtitle="تنبيهات فورية داخل التطبيق للرسائل الجديدة وفتح المحادثات وتحديثات القراءة، مع عداد مباشر لغير المقروء."
      />

      <SectionCard
        title="مركز الإشعارات"
        subtitle="يمكنك مراجعة كل التنبيهات، تصفية غير المقروء، وتعليمها كمقروءة من نفس الشاشة."
        badge="Inbox"
        action={
          <Button type="button" variant="secondary" onClick={markAllRead} disabled={!meta.unreadCount}>
            <CheckCheck className="size-4" />
            تحديد الكل كمقروء
          </Button>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              الكل
            </FilterButton>
            <FilterButton active={filter === "unread"} onClick={() => setFilter("unread")}>
              غير المقروءة
            </FilterButton>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-2 text-sm font-semibold text-foreground">
            <Bell className="size-4 text-primary" />
            {meta.unreadCount || 0} غير مقروءة
          </div>
        </div>

        <NotificationList
          notifications={notifications}
          loading={loading}
          error={error}
          hasMore={meta.hasNextPage}
          onLoadMore={loadMore}
          onRetry={refresh}
          onMarkRead={markAsRead}
        />
      </SectionCard>
    </div>
  );
}
