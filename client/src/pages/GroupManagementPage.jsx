import { useEffect, useState } from "react";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import StatusBadge from "../components/shared/StatusBadge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import { createGroupPost, getGroup, updateGroup, updateGroupPost } from "../features/groups/groups.api";
import { formatDateTime } from "../utils/date";
import { getErrorMessage } from "../utils/error";
import { useParams } from "react-router-dom";

export default function GroupManagementPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    category: "",
    visibility: "public"
  });
  const [postForm, setPostForm] = useState({
    title: "",
    content: ""
  });
  const [editingPostId, setEditingPostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingGroup, setSavingGroup] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadGroup = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getGroup(id);
      const nextGroup = response.data.data;
      setGroup(nextGroup);
      setGroupForm({
        name: nextGroup.name,
        description: nextGroup.description,
        category: nextGroup.category,
        visibility: nextGroup.visibility.toLowerCase()
      });
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل المجموعة."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
  }, [id]);

  const handleGroupSubmit = async (event) => {
    event.preventDefault();
    setSavingGroup(true);
    setError("");
    setSuccess("");

    try {
      await updateGroup(id, groupForm);
      setSuccess("تم تحديث إعدادات المجموعة بنجاح.");
      await loadGroup();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحديث المجموعة."));
    } finally {
      setSavingGroup(false);
    }
  };

  const handlePostSubmit = async (event) => {
    event.preventDefault();
    setSavingPost(true);
    setError("");
    setSuccess("");

    try {
      if (editingPostId) {
        await updateGroupPost(editingPostId, postForm);
        setSuccess("تم تحديث منشور المجموعة بنجاح.");
      } else {
        await createGroupPost(id, postForm);
        setSuccess("تم إنشاء منشور المجموعة بنجاح.");
      }

      setEditingPostId(null);
      setPostForm({ title: "", content: "" });
      await loadGroup();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر حفظ منشور المجموعة."));
    } finally {
      setSavingPost(false);
    }
  };

  const startEditingPost = (post) => {
    setEditingPostId(post.id);
    setPostForm({
      title: post.title,
      content: post.content
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="إدارة الطبيب"
        title={group?.name || "إدارة المجموعة"}
        subtitle="حدّث إعدادات المجموعة وانشر محتوى تعليمياً للأعضاء."
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {success}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <SectionCard
          title="إعدادات المجموعة"
          subtitle="تحدد هذه التفاصيل مستوى الظهور وما يتوقعه المرضى من المجموعة."
          action={group ? <StatusBadge value={group.visibility} /> : null}
        >
          <form className="grid gap-4" onSubmit={handleGroupSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="اسم المجموعة"
                value={groupForm.name}
                onChange={(event) => setGroupForm((current) => ({ ...current, name: event.target.value }))}
                disabled={loading}
              />
              <Input
                label="التصنيف"
                value={groupForm.category}
                onChange={(event) => setGroupForm((current) => ({ ...current, category: event.target.value }))}
                disabled={loading}
              />
            </div>
            <Select
              label="مستوى الظهور"
              value={groupForm.visibility}
              onChange={(event) => setGroupForm((current) => ({ ...current, visibility: event.target.value }))}
              disabled={loading}
            >
              <option value="public">عامة</option>
              <option value="private">خاصة</option>
            </Select>
            <Textarea
              label="الوصف"
              value={groupForm.description}
              onChange={(event) => setGroupForm((current) => ({ ...current, description: event.target.value }))}
              disabled={loading}
            />
            <Button type="submit" disabled={savingGroup || loading}>
              {savingGroup ? "جارٍ الحفظ..." : "حفظ إعدادات المجموعة"}
            </Button>
          </form>
        </SectionCard>

        <SectionCard
          title={editingPostId ? "تعديل منشور المجموعة" : "إنشاء منشور مجموعة"}
          subtitle="يمكن للأطباء فقط نشر محتوى تعليمي داخل المجموعات."
        >
          <form className="grid gap-4" onSubmit={handlePostSubmit}>
            <Input
              label="عنوان المنشور"
              value={postForm.title}
              onChange={(event) => setPostForm((current) => ({ ...current, title: event.target.value }))}
            />
            <Textarea
              label="المحتوى"
              value={postForm.content}
              onChange={(event) => setPostForm((current) => ({ ...current, content: event.target.value }))}
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={savingPost}>
                {savingPost ? "جارٍ الحفظ..." : editingPostId ? "تحديث المنشور" : "نشر المنشور"}
              </Button>
              {editingPostId ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingPostId(null);
                    setPostForm({ title: "", content: "" });
                  }}
                >
                  إلغاء التعديل
                </Button>
              ) : null}
            </div>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="المنشورات المنشورة" subtitle="المحتوى التعليمي الحالي داخل هذه المجموعة.">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[22px] border border-border/60 px-4 py-6" />
            ))}
          </div>
        ) : group?.posts?.length ? (
          <div className="space-y-3">
            {group.posts.map((post) => (
              <div key={post.id} className="rounded-[22px] border border-border/60 bg-secondary/35 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold">{post.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(post.createdAt)}</p>
                  </div>
                  <Button type="button" variant="ghost" onClick={() => startEditingPost(post)}>
                    تعديل
                  </Button>
                </div>
                <p className="mt-4 text-sm leading-7 text-foreground">{post.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border/70 bg-card/40 px-4 py-10 text-center text-sm text-muted-foreground">
            لم يتم نشر أي منشورات في هذه المجموعة بعد.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
