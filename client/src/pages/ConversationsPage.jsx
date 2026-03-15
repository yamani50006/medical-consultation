import { Bell, MessageCircleMore, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import ConversationList from "../components/chat/ConversationList";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useConversationList } from "../features/chat/useConversationList";

function SummaryTile({ label, value, description }) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-card/35 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export default function ConversationsPage() {
  const { conversations, meta, loading, error, search, setSearch, refresh, loadMore } = useConversationList();

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Chat Workspace"
        title="المحادثات"
        subtitle="تابع محادثاتك الطبية الخاصة بين الطبيب والمريض مع ترتيب حسب آخر نشاط وعدّاد للرسائل غير المقروءة."
      />

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          title="نظرة سريعة"
          subtitle="ملخص فوري لنشاط المحادثات والإشعارات داخل التطبيق."
          badge="Realtime Summary"
          action={
            <Button asChild variant="secondary">
              <Link to="/notifications">
                <Bell className="size-4" />
                مركز الإشعارات
              </Link>
            </Button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryTile
              label="المحادثات"
              value={meta.total || conversations.length}
              description="عدد المحادثات المرتبطة بالاستشارات الحالية."
            />
            <SummaryTile
              label="غير المقروءة"
              value={meta.unreadCount || 0}
              description="رسائل جديدة تحتاج إلى مراجعة."
            />
          </div>

          {!conversations.length && !loading ? (
            <EmptyState
              title="لم تبدأ أي محادثة بعد"
              description="يمكنك فتح المحادثة من صفحة الاستشارات لكل استشارة مرتبطة بطبيب أو مريض."
              icon={MessageCircleMore}
            />
          ) : null}
        </SectionCard>

        <SectionCard
          title="قائمة المحادثات"
          subtitle="ابحث باسم الطرف الآخر أو بعنوان الاستشارة، ثم افتح غرفة الشات مباشرة."
          badge="Conversation Inbox"
          action={
            <Button type="button" variant="ghost" onClick={refresh} disabled={loading}>
              <RefreshCcw className="size-4" />
              تحديث
            </Button>
          }
        >
          <Input
            label="بحث"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث باسم الطبيب أو المريض أو بعنوان الاستشارة"
          />

          <ConversationList
            conversations={conversations}
            loading={loading}
            error={error}
            activeConversationId={null}
            onRetry={refresh}
            onLoadMore={loadMore}
            hasMore={meta.hasNextPage}
          />
        </SectionCard>
      </div>
    </div>
  );
}
