import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import {
  listMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from "../features/notifications/notifications.api";
import { formatDateTime } from "../utils/date";
import { getErrorMessage } from "../utils/error";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await listMyNotifications({ page: 1, limit: 50 });
      setNotifications(response.data.data);
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل الإشعارات."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحديث الإشعار."));
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحديث الإشعارات."));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="صندوق الإشعارات"
        title="الإشعارات"
        subtitle="تابع تحديثات الخطط العلاجية ونشاط الاستشارات والمتابعات والمنشورات التعليمية."
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <SectionCard
        title="آخر التحديثات"
        subtitle="تُحفظ الإشعارات داخل التطبيق ويمكن تعليمها كمقروءة في أي وقت."
        action={
          <Button type="button" variant="secondary" onClick={handleMarkAll}>
            <CheckCheck className="size-4" />
            تحديد الكل كمقروء
          </Button>
        }
      >
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded-[22px] border border-border/60 p-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-3 h-4 w-64" />
              </div>
            ))}
          </div>
        ) : notifications.length ? (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-[24px] border p-4 transition-colors duration-300 ${
                item.isRead ? "border-border/60 bg-card/40" : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Bell className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                  </div>
                </div>
                {!item.isRead ? (
                  <Button type="button" variant="ghost" onClick={() => handleMarkAsRead(item.id)}>
                    تحديد كمقروء
                  </Button>
                ) : (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    مقروء
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="لا توجد إشعارات حتى الآن" description="ستظهر تحديثاتك داخل التطبيق هنا." icon={Bell} />
        )}
      </SectionCard>
    </div>
  );
}
