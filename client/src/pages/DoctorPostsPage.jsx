import { startTransition, useEffect, useState } from "react";
import FormError from "../components/forms/FormError";
import AnimatedCard from "../components/shared/AnimatedCard";
import PageHeader from "../components/shared/PageHeader";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Skeleton from "../components/ui/Skeleton";
import Textarea from "../components/ui/Textarea";
import { createPost, deletePost, listMyPosts, updatePost } from "../features/posts/posts.api";
import { formatStatus, getStatusBadgeVariant } from "../utils/status";
import { getErrorMessage } from "../utils/error";

const initialForm = {
  title: "",
  content: "",
  specialization: "",
  status: "published"
};

export default function DoctorPostsPage() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const loadPosts = async () => {
    try {
      setFetching(true);
      const response = await listMyPosts({ page: 1, limit: 50 });
      startTransition(() => {
        setPosts(response.data.data);
      });
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل منشورات الطبيب."));
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (editId) {
        await updatePost(editId, form);
      } else {
        await createPost(form);
      }
      setForm(initialForm);
      setEditId(null);
      await loadPosts();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر حفظ المنشور."));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (post) => {
    setEditId(post.id);
    setForm({
      title: post.title,
      content: post.content,
      specialization: post.specialization,
      status: post.status.toLowerCase()
    });
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await deletePost(id);
      await loadPosts();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر حذف المنشور."));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="استوديو الطبيب"
        title="منشورات الطبيب"
        subtitle="أنشئ وعدّل وأدر منشوراتك الطبية ضمن واجهة واضحة وسريعة."
      />

      <Card className="rounded-[34px]">
        <CardContent className="p-8">
          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <Input label="العنوان" name="title" value={form.title} onChange={handleChange} required />
            <Input
              label="التخصص"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              required
            />
            <Select label="الحالة" name="status" value={form.status} onChange={handleChange}>
              <option value="published">منشور</option>
              <option value="draft">مسودة</option>
            </Select>
            <div className="hidden md:block" />
            <div className="md:col-span-2">
              <Textarea label="المحتوى" name="content" value={form.content} onChange={handleChange} required />
            </div>
            <div className="md:col-span-2 space-y-4">
              <FormError message={error} />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                  {loading ? "جارٍ الحفظ..." : editId ? "تحديث المنشور" : "إنشاء منشور"}
                </Button>
                {editId ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      setEditId(null);
                      setForm(initialForm);
                    }}
                  >
                    إلغاء التعديل
                  </Button>
                ) : null}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fetching
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[30px] border border-border/60 p-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="mt-4 h-6 w-3/4" />
                <Skeleton className="mt-5 h-20 w-full" />
              </div>
            ))
          : posts.map((post, index) => (
              <AnimatedCard key={post.id} index={index} className="rounded-[30px]">
                <div className="space-y-5 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <Badge variant={getStatusBadgeVariant(post.status)}>{formatStatus(post.status)}</Badge>
                    <span className="text-sm text-muted-foreground">{post.specialization}</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-display text-xl font-semibold">{post.title}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{post.content}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="secondary" onClick={() => startEdit(post)}>
                      تعديل
                    </Button>
                    <Button type="button" variant="danger" onClick={() => handleDelete(post.id)}>
                      حذف
                    </Button>
                  </div>
                </div>
              </AnimatedCard>
            ))}
      </div>

      {!fetching && posts.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-border/70 bg-card/40 px-6 py-10 text-center text-muted-foreground">
          لا توجد منشورات للطبيب حتى الآن.
        </div>
      ) : null}
    </div>
  );
}
