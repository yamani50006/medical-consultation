import { useEffect, useState } from "react";
import DataTable from "../components/shared/DataTable";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import Skeleton from "../components/ui/Skeleton";
import { getAdminAnalytics } from "../features/dashboard/dashboard.api";
import { getErrorMessage } from "../utils/error";
import { formatStatus } from "../utils/status";

export default function AnalyticsSummaryPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getAdminAnalytics();
        if (!cancelled) {
          setAnalytics(response.data.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "تعذر تحميل التحليلات."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        badge="تحليلات الإدارة"
        title="ملخص التحليلات"
        subtitle="توزيعات الحالات ومؤشرات الجودة على مستوى المنصة لعمليات المرحلة الثانية."
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[30px] border border-border/60 p-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-4 h-10 w-16" />
              </div>
            ))
          : [
              { label: "المستخدمون", value: analytics?.overview?.totalUsers || 0 },
              { label: "الأطباء", value: analytics?.overview?.totalDoctors || 0 },
              { label: "الخطط", value: analytics?.overview?.totalTreatmentPlans || 0 },
              { label: "المجموعات", value: analytics?.overview?.totalGroups || 0 }
            ].map((item) => (
              <div key={item.label} className="rounded-[30px] border border-border/60 bg-card/70 p-6">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-4 font-display text-4xl font-semibold">{item.value}</p>
              </div>
            ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="توزيع حالات الاستشارات" subtitle="كيف يتوزع نشاط الاستشارات حسب الحالة الحالية.">
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <DataTable
              columns={[
                { key: "status", label: "الحالة", render: (row) => formatStatus(row.status) },
                { key: "count", label: "العدد" }
              ]}
              rows={analytics?.consultationStatusBreakdown || []}
            />
          )}
        </SectionCard>

        <SectionCard title="توزيع حالات المواعيد" subtitle="حجم المواعيد عبر حالات الجدولة المختلفة.">
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <DataTable
              columns={[
                { key: "status", label: "الحالة", render: (row) => formatStatus(row.status) },
                { key: "count", label: "العدد" }
              ]}
              rows={analytics?.appointmentStatusBreakdown || []}
            />
          )}
        </SectionCard>

        <SectionCard title="توزيع حالات الخطط العلاجية" subtitle="الحالة الحالية لدورة حياة الخطط العلاجية.">
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <DataTable
              columns={[
                { key: "status", label: "الحالة", render: (row) => formatStatus(row.status) },
                { key: "count", label: "العدد" }
              ]}
              rows={analytics?.treatmentPlanStatusBreakdown || []}
            />
          )}
        </SectionCard>

        <SectionCard title="توزيع مستوى ظهور المجموعات" subtitle="التوزيع بين المجموعات التعليمية العامة والخاصة.">
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <DataTable
              columns={[
                { key: "visibility", label: "مستوى الظهور", render: (row) => formatStatus(row.visibility) },
                { key: "count", label: "العدد" }
              ]}
              rows={analytics?.groupVisibilityBreakdown || []}
            />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <SectionCard title="لقطة التقييمات" subtitle="اتجاه الانطباع العام بناءً على تقييمات المرضى المرسلة.">
          {loading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-border/60 bg-secondary/35 p-5">
                <p className="text-sm text-muted-foreground">متوسط التقييم</p>
                <p className="mt-3 font-display text-5xl font-semibold">
                  {analytics?.reviewSnapshot?.averageRating || 0}
                </p>
              </div>
              <div className="rounded-[24px] border border-border/60 bg-secondary/35 p-5">
                <p className="text-sm text-muted-foreground">إجمالي التقييمات</p>
                <p className="mt-3 font-display text-5xl font-semibold">
                  {analytics?.reviewSnapshot?.totalReviews || 0}
                </p>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="أفضل الأطباء تقييماً" subtitle="الأطباء المعتمدون الأعلى تقييماً وفقاً لمتوسطات التقييم الحالية.">
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <DataTable
              columns={[
                {
                  key: "doctor",
                  label: "الطبيب",
                  render: (row) => row.doctor?.user?.fullName || "-"
                },
                {
                  key: "specialization",
                  label: "التخصص",
                  render: (row) => row.doctor?.specialization || "-"
                },
                {
                  key: "averageRating",
                  label: "متوسط التقييم"
                },
                {
                  key: "totalReviews",
                  label: "التقييمات"
                }
              ]}
              rows={analytics?.topRatedDoctors || []}
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
