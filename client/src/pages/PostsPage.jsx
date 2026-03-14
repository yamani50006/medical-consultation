import { Search } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import AnimatedCard from "../components/shared/AnimatedCard";
import PageHeader from "../components/shared/PageHeader";
import RevealSection from "../components/shared/RevealSection";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Skeleton from "../components/ui/Skeleton";
import { listPosts } from "../features/posts/posts.api";
import { getErrorMessage } from "../utils/error";

export default function PostsPage() {
  const [filters, setFilters] = useState({ search: "", specialization: "" });
  const deferredSearch = useDeferredValue(filters.search);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listPosts({
        page: 1,
        limit: 20,
        search: filters.search || undefined,
        specialization: filters.specialization || undefined
      });
      startTransition(() => {
        setPosts(response.data.data);
        setMeta(response.data.meta);
      });
    } catch (err) {
      setError(getErrorMessage(err, "تعذر جلب المنشورات الطبية."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        badge="المحتوى الطبي"
        title="المنشورات الطبية"
        subtitle="محتوى توعوي من أطباء معتمدين مع تصفية واضحة وتجربة قراءة سريعة."
      />

      <RevealSection className="rounded-[32px] border border-border/60 bg-card/65 p-6 shadow-card backdrop-blur-xl">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr_auto] lg:items-end">
          <Input
            label="البحث في العنوان أو المحتوى"
            name="search"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="القلب، السكري، التغذية..."
          />
          <Input
            label="التخصص"
            name="specialization"
            value={filters.specialization}
            onChange={(e) => setFilters((prev) => ({ ...prev, specialization: e.target.value }))}
            placeholder="قلب، جلدية، أطفال..."
          />
          <Button variant="primary" onClick={fetchPosts} disabled={loading} className="w-full lg:w-auto">
            <Search className="size-4" />
            {loading ? "جارٍ التحميل..." : "تطبيق التصفية"}
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary">{meta?.total || 0} منشور</Badge>
          {deferredSearch ? <span>يتم البحث عن "{deferredSearch}"</span> : <span>استعرض أحدث النصائح الطبية المنشورة.</span>}
        </div>
      </RevealSection>

      {error ? (
        <div className="rounded-[24px] border border-destructive/20 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-[30px] border border-border/60 p-6">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="mt-4 h-7 w-3/4" />
                <Skeleton className="mt-5 h-20 w-full" />
              </div>
            ))
          : posts.map((post, index) => (
              <AnimatedCard key={post.id} index={index} className="rounded-[30px]">
                <div className="space-y-5 p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>{post.specialization}</Badge>
                    <span className="text-sm text-muted-foreground">{post.doctor?.user?.fullName}</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-display text-xl font-semibold tracking-tight">{post.title}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{post.content}</p>
                  </div>
                </div>
              </AnimatedCard>
            ))}
      </div>

      {!loading && posts.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-border/70 bg-card/40 px-6 py-10 text-center text-muted-foreground">
          لا توجد منشورات منشورة تطابق عوامل التصفية الحالية.
        </div>
      ) : null}
    </div>
  );
}
