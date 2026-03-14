import { BookOpenCheck, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import StatusBadge from "../components/shared/StatusBadge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Skeleton from "../components/ui/Skeleton";
import { joinGroup, listGroups, listMyGroups } from "../features/groups/groups.api";
import useAuth from "../hooks/useAuth";
import { formatDate } from "../utils/date";
import { getErrorMessage } from "../utils/error";

export default function GroupsPage() {
  const { user } = useAuth();
  const isPatient = user?.role === "PATIENT";
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scope, setScope] = useState(isPatient ? "discover" : "mine");
  const [filters, setFilters] = useState({
    search: "",
    visibility: ""
  });

  const loadGroups = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page: 1,
        limit: 50,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.visibility ? { visibility: filters.visibility } : {})
      };
      const response =
        isPatient && scope === "mine" ? await listMyGroups(params) : await listGroups(params);
      setGroups(response.data.data);
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل المجموعات."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [filters.search, filters.visibility, isPatient, scope]);

  const handleJoin = async (groupId) => {
    try {
      await joinGroup(groupId);
      setGroups((current) =>
        current.map((item) => (item.id === groupId ? { ...item, isJoined: true } : item))
      );
    } catch (err) {
      setError(getErrorMessage(err, "تعذر الانضمام إلى المجموعة."));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge={isPatient ? "المجموعات التعليمية" : "مجتمعات الطبيب"}
        title="المجموعات"
        subtitle={
          isPatient
            ? "انضم إلى المجموعات التعليمية، وتابع منشورات الأطباء، وارجع بسهولة إلى مجموعاتك."
            : "أنشئ وأدر وانشر مجموعات تعليمية لمرضاك."
        }
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <SectionCard
        title="الاكتشاف والتصفية"
        subtitle="ابحث حسب الموضوع أو صفِّ النتائج حسب مستوى الظهور."
        action={
          !isPatient ? (
            <Button asChild>
              <Link to="/doctor/groups/create">
                <Plus className="size-4" />
                إنشاء مجموعة
              </Link>
            </Button>
          ) : (
            <div className="flex rounded-full border border-border/60 bg-card/50 p-1">
              {[
                { value: "discover", label: "استكشاف" },
                { value: "mine", label: "المنضم إليها" }
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setScope(item.value)}
                  className={`rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                    scope === item.value ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="بحث"
            placeholder="اسم المجموعة أو الوصف أو التصنيف"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
          <Select
            label="مستوى الظهور"
            value={filters.visibility}
            onChange={(event) => setFilters((current) => ({ ...current, visibility: event.target.value }))}
          >
            <option value="">الكل</option>
            <option value="public">عامة</option>
            <option value="private">خاصة</option>
          </Select>
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[30px] border border-border/60 p-6">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="mt-4 h-16 w-full" />
              </div>
            ))
          : groups.map((group) => (
              <SectionCard
                key={group.id}
                title={group.name}
                subtitle={group.createdByDoctor?.user?.fullName}
                action={<StatusBadge value={group.visibility} />}
                className="h-full"
              >
                <p className="text-sm leading-7 text-muted-foreground">{group.description}</p>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>{group.category}</span>
                  <span>{group._count?.memberships || 0} عضو</span>
                  <span>{group._count?.posts || 0} منشور</span>
                  <span>أُنشئت في {formatDate(group.createdAt)}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="secondary">
                    <Link to={isPatient ? `/groups/${group.id}` : `/doctor/groups/${group.id}/manage`}>
                      {isPatient ? "فتح المجموعة" : "إدارة المجموعة"}
                    </Link>
                  </Button>
                  {isPatient && !group.isJoined ? (
                    <Button type="button" variant="ghost" onClick={() => handleJoin(group.id)}>
                      انضمام إلى المجموعة
                    </Button>
                  ) : null}
                </div>
              </SectionCard>
            ))}
      </div>

      {!loading && groups.length === 0 ? (
        <EmptyState
          title={isPatient ? "لا توجد مجموعات" : "لم يتم إنشاء مجموعات بعد"}
          description={
            isPatient
              ? "جرّب تعديل الفلاتر أو الانضمام إلى مجموعة تعليمية عامة أو خاصة تمت دعوتك إليها."
              : "أنشئ أول مجموعة تعليمية لمرضاك لبدء مشاركة محتوى منظم."
          }
          icon={isPatient ? Users : BookOpenCheck}
          action={
            !isPatient ? (
              <Button asChild>
                <Link to="/doctor/groups/create">إنشاء مجموعة</Link>
              </Button>
            ) : null
          }
        />
      ) : null}
    </div>
  );
}
