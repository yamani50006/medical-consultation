import { BookOpen, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import StatusBadge from "../components/shared/StatusBadge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { getGroup, joinGroup } from "../features/groups/groups.api";
import { formatDateTime } from "../utils/date";
import { getErrorMessage } from "../utils/error";

export default function GroupDetailsPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const loadGroup = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getGroup(id);
      setGroup(response.data.data);
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل المجموعة."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    setError("");

    try {
      await joinGroup(id);
      await loadGroup();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر الانضمام إلى المجموعة."));
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="مجموعة تعليمية"
        title={group?.name || "تفاصيل المجموعة"}
        subtitle="اقرأ المنشورات التعليمية التي ينشرها الطبيب داخل المجموعات التي يمكنك الوصول إليها."
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-[30px] border border-border/60 p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-4 h-20 w-full" />
            </div>
          ))}
        </div>
      ) : group ? (
        <>
          <SectionCard
            title={group.name}
            subtitle={group.createdByDoctor?.user?.fullName}
            action={<StatusBadge value={group.visibility} />}
          >
            <p className="text-sm leading-7 text-muted-foreground">{group.description}</p>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>{group.category}</span>
              <span>{group._count?.memberships || 0} عضو</span>
              <span>{group._count?.posts || 0} منشور</span>
            </div>
            {!group.isJoined && group.visibility !== "PUBLIC" ? (
              <div className="rounded-[22px] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                انضم إلى هذه المجموعة الخاصة لعرض جميع المنشورات التعليمية التي ينشرها الطبيب.
              </div>
            ) : null}
            {!group.isJoined ? (
              <Button type="button" onClick={handleJoin} disabled={joining}>
                <PlusCircle className="size-4" />
                {joining ? "جارٍ الانضمام..." : "انضمام إلى المجموعة"}
              </Button>
            ) : null}
          </SectionCard>

          <SectionCard title="منشورات المجموعة" subtitle="محتوى تعليمي منشور من الطبيب المالك للمجموعة.">
            {group.posts?.length ? (
              group.posts.map((post) => (
                <div key={post.id} className="rounded-[24px] border border-border/60 bg-secondary/35 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-xl font-semibold">{post.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{post.doctor?.user?.fullName}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDateTime(post.createdAt)}</p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-foreground">{post.content}</p>
                </div>
              ))
            ) : (
              <EmptyState
                title="لا توجد منشورات بعد"
                description="تم إنشاء هذه المجموعة، لكن الطبيب لم ينشر فيها محتوى تعليمياً بعد."
                icon={BookOpen}
              />
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
