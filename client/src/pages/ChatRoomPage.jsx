import { AlertCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import ChatHeader from "../components/chat/ChatHeader";
import MessageInput from "../components/chat/MessageInput";
import MessageList from "../components/chat/MessageList";
import LoadingState from "../components/shared/LoadingState";
import PageHeader from "../components/shared/PageHeader";
import { Card } from "../components/ui/Card";
import { useConversationRoom } from "../features/chat/useConversationRoom";

export default function ChatRoomPage() {
  const { id } = useParams();
  const { conversation, messages, meta, loading, loadingMore, sending, error, sendMessage, loadOlderMessages } =
    useConversationRoom(id);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Secure Chat"
        title={conversation?.counterpart?.fullName || "غرفة المحادثة"}
        subtitle="محادثة مباشرة وآمنة داخل التطبيق مع دعم المرفقات الطبية وحالات التسليم والقراءة."
      />

      {error && !conversation ? (
        <div className="rounded-[26px] border border-destructive/20 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4" />
            {error}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_20rem]">
        <Card className="overflow-hidden rounded-[30px]">
          {conversation ? <ChatHeader conversation={conversation} /> : null}

          <div className="max-h-[60vh] overflow-y-auto px-5 py-5">
            {loading && !conversation ? (
              <LoadingState rows={5} />
            ) : (
              <MessageList
                messages={messages}
                loading={loading}
                loadingMore={loadingMore}
                onLoadOlder={loadOlderMessages}
                hasMore={meta.hasMore}
              />
            )}
          </div>

          <MessageInput onSend={sendMessage} sending={sending} />
        </Card>

        <Card className="rounded-[30px]">
          <div className="space-y-4 p-6">
            <h2 className="font-display text-xl font-semibold">تفاصيل المحادثة</h2>
            <div className="rounded-[24px] border border-border/60 bg-secondary/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">الاستشارة</p>
              <p className="mt-3 font-medium">{conversation?.consultation?.subject || "غير متاحة"}</p>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-secondary/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">الرسائل</p>
              <p className="mt-3 font-medium">{meta.total || messages.length}</p>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-secondary/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">غير المقروء</p>
              <p className="mt-3 font-medium">{conversation?.unreadCount || 0}</p>
            </div>
            <div className="rounded-[24px] border border-dashed border-border/70 bg-card/25 p-4 text-sm leading-7 text-muted-foreground">
              هذه البنية جاهزة للتوسع لاحقًا نحو الرسائل الصوتية وتعديل الرسائل وحذفها بدون إعادة كتابة جذرية.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
