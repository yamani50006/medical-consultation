import { Activity, Clock3, ShieldAlert, Stethoscope, Users } from "lucide-react";
import AdminAlertsPanel from "../components/admin/AdminAlertsPanel";
import AdminStatCard from "../components/admin/AdminStatCard";
import LoadingState from "../components/shared/LoadingState";
import PageHeader from "../components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useAdminAlertsData } from "../hooks/useAdminAlertsData";
import { useAdminDashboardData } from "../hooks/useAdminDashboardData";
import { useAdminSectionAnimation } from "../hooks/useAdminSectionAnimation";
import { formatMetric } from "../utils/admin";

export default function AdminDashboardPage() {
  const { overview, loading, error } = useAdminDashboardData();
  const alertsState = useAdminAlertsData({ page: 1, limit: 6 });
  const animationRef = useAdminSectionAnimation([loading, alertsState.loading, overview, alertsState.items.length]);

  const metrics = overview?.metrics || {};
  const patientInsights = overview?.patientInsights || {};
  const demandInsights = overview?.demandInsights || {};

  const cards = [
    {
      title: "إجمالي الأطباء",
      value: metrics.totalDoctors,
      subtitle: "كل الأطباء غير المحذوفين منطقيًا",
      tone: "primary"
    },
    {
      title: "أطباء نشطون",
      value: metrics.activeDoctors,
      subtitle: "يستقبلون حالات جديدة حاليًا",
      tone: "primary"
    },
    {
      title: "أطباء موقوفون",
      value: metrics.suspendedDoctors,
      subtitle: "ممنوعون من استقبال استشارات جديدة",
      tone: "danger"
    },
    {
      title: "بانتظار التفعيل",
      value: metrics.pendingDoctors,
      subtitle: "ملفات تحتاج قرارًا إداريًا",
      tone: "warning"
    },
    {
      title: "استشارات اليوم",
      value: metrics.consultationsToday,
      subtitle: "الحجم التشغيلي اليومي",
      tone: "primary"
    },
    {
      title: "استشارات الأسبوع",
      value: metrics.consultationsThisWeek,
      subtitle: "النشاط المتراكم هذا الأسبوع",
      tone: "primary"
    },
    {
      title: "مرضى اليوم",
      value: metrics.patientsToday,
      subtitle: "مرضى فريدون حصلوا على استشارة",
      tone: "primary"
    },
    {
      title: "متوسط التقييم",
      value: metrics.averageDoctorRating,
      subtitle: "متوسط تقييم الأطباء الحالي",
      tone: "primary"
    },
    {
      title: "متوسط زمن الرد",
      value: metrics.averageResponseMinutes,
      subtitle: "بالدقائق على الاستشارات المردود عليها",
      tone: "warning"
    }
  ];

  return (
    <div ref={animationRef} className="space-y-8">
      <PageHeader
        badge="Admin Dashboard"
        title="لوحة الإدارة التشغيلية"
        subtitle="متابعة الأداء، الطلب، والتنبيهات الذكية عبر واجهة إدارية موحدة وقابلة للتوسع."
      />

      {error ? <AlertMessage message={error} /> : null}

      {loading ? (
        <LoadingState rows={4} />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((item) => (
              <AdminStatCard key={item.title} {...item} />
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card data-admin-animate="card" className="border-border/60 bg-card/70">
              <CardHeader>
                <CardTitle>متابعة المرضى والنمو</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <InsightCard icon={Users} title="مرضى فريدون اليوم" value={patientInsights.uniquePatientsToday} />
                <InsightCard icon={Users} title="مرضى فريدون هذا الأسبوع" value={patientInsights.uniquePatientsThisWeek} />
                <InsightCard icon={Activity} title="مرضى جدد" value={patientInsights.newPatients} />
                <InsightCard icon={Clock3} title="مرضى عائدون" value={patientInsights.returningPatients} />
              </CardContent>
            </Card>

            <AdminAlertsPanel
              alerts={alertsState.items}
              onStatusChange={alertsState.updateStatus}
              compact={false}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <Card data-admin-animate="card" className="border-border/60 bg-card/70">
              <CardHeader>
                <CardTitle>أكثر التخصصات طلبًا</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(demandInsights.topSpecializations || []).map((item) => (
                  <div key={item.specialization} className="flex items-center justify-between rounded-2xl bg-secondary/50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <Stethoscope className="size-5" />
                      </div>
                      <span className="font-medium">{item.specialization}</span>
                    </div>
                    <span className="font-display text-xl font-bold">{formatMetric(item.total)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card data-admin-animate="card" className="border-border/60 bg-card/70">
              <CardHeader>
                <CardTitle>أكثر الأوقات ازدحامًا</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(demandInsights.busiestHours || []).map((item) => (
                  <div key={item.hour} className="flex items-center justify-between rounded-2xl bg-secondary/50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
                        <Clock3 className="size-5" />
                      </div>
                      <span className="font-medium">{item.hour}</span>
                    </div>
                    <span className="font-display text-xl font-bold">{formatMetric(item.total)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function InsightCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-secondary/40 p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 font-display text-2xl font-bold">{formatMetric(value)}</p>
        </div>
      </div>
    </div>
  );
}

function AlertMessage({ message }) {
  return (
    <div className="rounded-[24px] border border-destructive/20 bg-destructive/10 px-5 py-4 text-sm text-destructive">
      <ShieldAlert className="ml-2 inline size-4" />
      {message}
    </div>
  );
}
