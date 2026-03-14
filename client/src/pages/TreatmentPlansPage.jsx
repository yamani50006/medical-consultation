import { ClipboardCheck, Plus } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import StatusBadge from "../components/shared/StatusBadge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Skeleton from "../components/ui/Skeleton";
import { listDoctorTreatmentPlans, listMyTreatmentPlans } from "../features/treatmentPlans/treatmentPlans.api";
import useAuth from "../hooks/useAuth";
import { formatDate } from "../utils/date";
import { getErrorMessage } from "../utils/error";

export default function TreatmentPlansPage() {
  const { user } = useAuth();
  const isPatient = user?.role === "PATIENT";
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    search: ""
  });

  useEffect(() => {
    let cancelled = false;

    const loadPlans = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page: 1,
          limit: 50,
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.search ? { search: filters.search } : {})
        };
        const response = isPatient ? await listMyTreatmentPlans(params) : await listDoctorTreatmentPlans(params);

        if (!cancelled) {
          startTransition(() => {
            setPlans(response.data.data);
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "تعذر تحميل الخطط العلاجية."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, [filters.search, filters.status, isPatient]);

  return (
    <div className="space-y-8">
      <PageHeader
        badge={isPatient ? "خطط المريض" : "خطط الطبيب"}
        title="الخطط العلاجية"
        subtitle={
          isPatient
            ? "راجع خطط الرعاية النشطة والمكتملة والأدوية وسجل المتابعة الخاص بك."
            : "أنشئ الخطط العلاجية وحدّثها وتابعها عبر مرضاك النشطين."
        }
      />

      <SectionCard
        title="الفلاتر"
        subtitle="اعثر بسرعة على الخطط حسب الحالة أو البحث النصي."
        action={
          !isPatient ? (
            <Button asChild>
              <Link to="/doctor/treatment-plans/create">
                <Plus className="size-4" />
                خطة علاجية جديدة
              </Link>
            </Button>
          ) : null
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="الحالة"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </Select>
          <Input
            label="بحث"
            placeholder="العنوان أو التشخيص أو التعليمات"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
        </div>
      </SectionCard>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[30px] border border-border/60 p-6">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-3 h-4 w-32" />
                <Skeleton className="mt-4 h-16 w-full" />
              </div>
            ))
          : plans.map((plan) => (
              <SectionCard
                key={plan.id}
                title={plan.title}
                subtitle={isPatient ? plan.doctor?.user?.fullName : plan.patient?.user?.fullName}
                badge={plan.consultation ? "مرتبطة باستشارة" : "خطة مباشرة"}
                action={<StatusBadge value={plan.status} />}
                className="h-full"
              >
                <p className="text-sm leading-7 text-muted-foreground">{plan.diagnosisSummary}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniStat label="البداية" value={formatDate(plan.startDate)} />
                  <MiniStat label="النهاية" value={formatDate(plan.endDate)} />
                  <MiniStat label="المتابعات" value={plan._count?.followUps || 0} />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="secondary">
                    <Link to={`${isPatient ? "/patient" : "/doctor"}/treatment-plans/${plan.id}`}>عرض التفاصيل</Link>
                  </Button>
                  {!isPatient ? (
                    <Button asChild variant="ghost">
                      <Link to={`/doctor/treatment-plans/${plan.id}/edit`}>تعديل الخطة</Link>
                    </Button>
                  ) : null}
                </div>
              </SectionCard>
            ))}
      </div>

      {!loading && plans.length === 0 ? (
        <EmptyState
          title={isPatient ? "لا توجد خطط علاجية مخصصة بعد" : "لا توجد خطط علاجية منشأة بعد"}
          description={
            isPatient
              ? "عندما ينشئ الطبيب خطة علاجية بعد الاستشارة أو الموعد ستظهر هنا."
              : "أنشئ أول خطة متابعة علاجية لبدء إدارة الأدوية وتحديثات التقدم."
          }
          icon={ClipboardCheck}
          action={
            !isPatient ? (
              <Button asChild>
                <Link to="/doctor/treatment-plans/create">إنشاء أول خطة</Link>
              </Button>
            ) : null
          }
        />
      ) : null}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-[22px] border border-border/60 bg-secondary/35 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-sm font-medium">{value}</p>
    </div>
  );
}
