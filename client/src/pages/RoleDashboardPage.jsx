import { Bell, CalendarRange, ClipboardList, HeartPulse, Star, Users } from "lucide-react";
import { startTransition, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DashboardWidget from "../components/shared/DashboardWidget";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import RevealSection from "../components/shared/RevealSection";
import SectionCard from "../components/shared/SectionCard";
import StatusBadge from "../components/shared/StatusBadge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { animateDashboardWidgets } from "../animations/gsapAnimations";
import { getAdminDashboard, getDoctorDashboard, getPatientDashboard } from "../features/dashboard/dashboard.api";
import useAuth from "../hooks/useAuth";
import { formatDate, formatDateTime } from "../utils/date";
import { getErrorMessage } from "../utils/error";
import { formatRole } from "../utils/status";

function buildWidgets(role, data) {
  if (role === "PATIENT") {
    return [
      {
        title: "الخطط العلاجية النشطة",
        value: data.activeTreatmentPlans?.length || 0,
        subtitle: "الخطط الحالية التي ما زالت تحتاج إلى التزام ومتابعة.",
        badge: "الخطط",
        accent: "linear-gradient(90deg, #0f766e, #14b8a6)",
        series: [18, 34, 52, 44, 62]
      },
      {
        title: "المواعيد القادمة",
        value: data.upcomingAppointments?.length || 0,
        subtitle: "مواعيدك الطبية القادمة المجدولة.",
        badge: "الجدول",
        accent: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
        series: [12, 28, 46, 54, 58]
      },
      {
        title: "المجموعات المنضمة",
        value: data.joinedGroups?.length || 0,
        subtitle: "المجتمعات التعليمية التي تتابعها حالياً.",
        badge: "المجموعات",
        accent: "linear-gradient(90deg, #16a34a, #22c55e)",
        series: [10, 22, 30, 44, 54]
      }
    ];
  }

  if (role === "DOCTOR") {
    return [
      {
        title: "مواعيد اليوم",
        value: data.todayAppointments?.length || 0,
        subtitle: "المواعيد المجدولة لهذا اليوم.",
        badge: "اليوم",
        accent: "linear-gradient(90deg, #0284c7, #06b6d4)",
        series: [14, 30, 38, 56, 64]
      },
      {
        title: "الاستشارات المعلقة",
        value: data.pendingConsultations?.length || 0,
        subtitle: "الاستشارات التي ما زالت بانتظار رد الطبيب.",
        badge: "الطابور",
        accent: "linear-gradient(90deg, #d97706, #f59e0b)",
        series: [20, 34, 48, 42, 58]
      },
      {
        title: "الخطط العلاجية النشطة",
        value: data.activeTreatmentPlansCount || 0,
        subtitle: "المرضى الموجودون حالياً ضمن خطة علاجية فعالة.",
        badge: "الرعاية",
        accent: "linear-gradient(90deg, #0f766e, #2dd4bf)",
        series: [18, 32, 46, 60, 72]
      }
    ];
  }

  return [
    {
      title: "إجمالي المستخدمين",
      value: data.totalUsers || 0,
      subtitle: "جميع الحسابات المسجلة على مستوى المنصة.",
      badge: "المستخدمون",
      accent: "linear-gradient(90deg, #0891b2, #22d3ee)",
      series: [22, 42, 56, 70, 88]
    },
    {
      title: "الأطباء المعلقون",
      value: data.pendingDoctors || 0,
      subtitle: "ملفات الأطباء التي تنتظر موافقة الإدارة.",
      badge: "المراجعة",
      accent: "linear-gradient(90deg, #d97706, #f97316)",
      series: [14, 28, 40, 48, 54]
    },
    {
      title: "الخطط العلاجية",
      value: data.totalTreatmentPlans || 0,
      subtitle: "كل خطط متابعة المرضى التي أُنشئت في المرحلة الثانية.",
      badge: "الرعاية",
      accent: "linear-gradient(90deg, #15803d, #22c55e)",
      series: [12, 26, 38, 50, 64]
    }
  ];
}

export default function RoleDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const widgetsRef = useRef(null);

  useEffect(() => {
    if (!dashboard) {
      return undefined;
    }

    return animateDashboardWidgets(widgetsRef.current);
  }, [dashboard]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        let response;

        if (user?.role === "PATIENT") {
          response = await getPatientDashboard();
        } else if (user?.role === "DOCTOR") {
          response = await getDoctorDashboard();
        } else {
          response = await getAdminDashboard();
        }

        if (!cancelled) {
          startTransition(() => {
            setDashboard(response.data.data);
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "تعذر تحميل لوحة التحكم."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const widgets = buildWidgets(user?.role, dashboard || {});

  return (
    <div className="space-y-8">
      <PageHeader
        badge={`مساحة ${formatRole(user?.role) || "المستخدم"}`}
        title="لوحة المرحلة الثانية"
        subtitle="المتابعة العلاجية والالتزام بالخطة والمجموعات التعليمية والمؤشرات التشغيلية أصبحت الآن في مكان واحد."
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <RevealSection>
        <div ref={widgetsRef} className="grid gap-4 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-[30px] border border-border/60 p-6">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-4 h-10 w-20" />
                  <Skeleton className="mt-5 h-20 w-full" />
                </div>
              ))
            : widgets.map((widget, index) => (
                <div key={widget.title} data-dashboard-widget>
                  <DashboardWidget index={index} {...widget} />
                </div>
              ))}
        </div>
      </RevealSection>

      {user?.role === "PATIENT" ? <PatientDashboardSections dashboard={dashboard} loading={loading} /> : null}
      {user?.role === "DOCTOR" ? <DoctorDashboardSections dashboard={dashboard} loading={loading} /> : null}
      {user?.role === "ADMIN" ? <AdminDashboardSections dashboard={dashboard} loading={loading} /> : null}
    </div>
  );
}

function PatientDashboardSections({ dashboard, loading }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
        title="ملخص الخطط العلاجية"
        subtitle="عرض سريع لخططك النشطة وآخر نشاطات الرعاية والخطوات التالية."
        action={
          <Button asChild variant="secondary">
            <Link to="/patient/treatment-plans">فتح الخطط العلاجية</Link>
          </Button>
        }
      >
        {loading ? (
          <PatientDashboardSkeleton />
        ) : dashboard?.activeTreatmentPlans?.length ? (
          dashboard.activeTreatmentPlans.map((plan) => (
            <div key={plan.id} className="rounded-[24px] border border-border/60 bg-secondary/35 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{plan.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.doctor?.user?.fullName}</p>
                </div>
                <StatusBadge value={plan.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{formatDate(plan.startDate)}</span>
                <span>{plan.medications?.length || 0} أدوية</span>
              </div>
              <Button asChild className="mt-4" variant="ghost">
                <Link to={`/patient/treatment-plans/${plan.id}`}>عرض التفاصيل</Link>
              </Button>
            </div>
          ))
        ) : (
          <EmptyState
            title="لا توجد خطط علاجية نشطة بعد"
            description="عندما ينشئ الطبيب خطة علاجية لك ستظهر هنا مع الأدوية وإجراءات المتابعة."
            icon={HeartPulse}
          />
        )}
      </SectionCard>

      <div className="space-y-4">
        <SectionCard
          title="أحدث الإشعارات"
          subtitle="آخر التحديثات داخل المنصة حول الخطط العلاجية والاستشارات والمجموعات."
          badge="الوارد"
          action={
            <Button asChild variant="ghost">
              <Link to="/patient/notifications">فتح الإشعارات</Link>
            </Button>
          }
        >
          {loading ? (
            <ListSkeleton />
          ) : dashboard?.recentNotifications?.length ? (
            dashboard.recentNotifications.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-[22px] border border-border/60 bg-secondary/30 p-4">
                <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Bell className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="لا توجد إشعارات بعد" description="ستظهر هنا آخر التحديثات الخاصة بك." icon={Bell} />
          )}
        </SectionCard>

        <SectionCard
          title="المواعيد القادمة"
          subtitle="تابع زياراتك الطبية القادمة المحجوزة."
          badge="الجدول"
        >
          {loading ? (
            <ListSkeleton />
          ) : dashboard?.upcomingAppointments?.length ? (
            dashboard.upcomingAppointments.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-border/60 bg-card/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.doctor?.user?.fullName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(item.appointmentDate)}</p>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="لا توجد مواعيد قادمة" description="ستظهر هنا المواعيد المحجوزة القادمة." icon={CalendarRange} />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function DoctorDashboardSections({ dashboard, loading }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <SectionCard
        title="تدفق متابعات المرضى"
        subtitle="أحدث التحديثات التي أرسلها المرضى ضمن خططك العلاجية النشطة."
        action={
          <Button asChild variant="secondary">
            <Link to="/doctor/follow-ups">إدارة المتابعات</Link>
          </Button>
        }
      >
        {loading ? (
          <ListSkeleton />
        ) : dashboard?.recentPatientFollowUps?.length ? (
          dashboard.recentPatientFollowUps.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-border/60 bg-secondary/35 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{item.patient?.user?.fullName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.treatmentPlan?.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-foreground">{item.symptomsStatus}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>الألم: {item.painLevel ?? "-"}/10</span>
                <span>الآثار الجانبية: {item.sideEffects || "لا يوجد"}</span>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="لا توجد تحديثات متابعة بعد"
            description="ستظهر تحديثات تقدم المرضى هنا بمجرد بدء وصول إدخالات المتابعة للخطط النشطة."
            icon={HeartPulse}
          />
        )}
      </SectionCard>

      <div className="space-y-4">
        <SectionCard
          title="مواعيد اليوم"
          subtitle="جدولك الطبي لليوم الحالي."
          badge="اليوم"
        >
          {loading ? (
            <ListSkeleton />
          ) : dashboard?.todayAppointments?.length ? (
            dashboard.todayAppointments.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-border/60 bg-card/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.patient?.user?.fullName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(item.appointmentDate)}</p>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="لا توجد مواعيد اليوم" description="جدولك خالٍ لهذا اليوم." icon={CalendarRange} />
          )}
        </SectionCard>

        <SectionCard
          title="أحدث التقييمات"
          subtitle="آخر ملاحظات المرضى حول رعايتك الطبية."
          badge="التقييمات"
          action={
            <Button asChild variant="ghost">
              <Link to="/doctor/reviews">فتح التقييمات</Link>
            </Button>
          }
        >
          {loading ? (
            <ListSkeleton />
          ) : dashboard?.latestReviews?.length ? (
            dashboard.latestReviews.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-border/60 bg-secondary/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{item.patient?.user?.fullName}</p>
                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600">
                    <Star className="size-4 fill-current" />
                    {item.rating}/5
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.comment || "لا يوجد تعليق مكتوب."}</p>
              </div>
            ))
          ) : (
            <EmptyState title="لا توجد تقييمات بعد" description="ستظهر تقييمات المرضى هنا بعد اكتمال التفاعلات العلاجية." icon={Star} />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function AdminDashboardSections({ dashboard, loading }) {
  const items = [
    { label: "الأطباء", value: dashboard?.totalDoctors },
    { label: "الاستشارات", value: dashboard?.totalConsultations },
    { label: "المواعيد", value: dashboard?.totalAppointments },
    { label: "المجموعات", value: dashboard?.totalGroups }
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <SectionCard
        title="نظرة عامة على المنصة"
        subtitle="الإجماليات الأساسية للمرحلة الثانية لفريق التشغيل."
        action={
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/admin/pending-doctors">الأطباء المعلقون</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/analytics">ملخص التحليلات</Link>
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[24px] border border-border/60 p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-4 h-8 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-border/60 bg-secondary/35 p-5">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-4 font-display text-4xl font-semibold">{item.value || 0}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="روابط الإدارة السريعة"
        subtitle="العمليات الأكثر استخداماً للمراجعة والتقارير."
        badge="العمليات"
      >
        <div className="grid gap-3">
          {[
            {
              title: "اعتماد الأطباء",
              description: "راجع طلبات تسجيل الأطباء المعلقة واعتمد الحسابات المؤهلة.",
              to: "/admin/pending-doctors",
              icon: Users
            },
            {
              title: "ملخص التحليلات",
              description: "استعرض توزيعات الحالات وملخص التقييمات وأعلى الأطباء تقييماً.",
              to: "/admin/analytics",
              icon: ClipboardList
            }
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                to={item.to}
                className="rounded-[22px] border border-border/60 bg-card/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <p className="mt-4 font-display text-lg font-semibold">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

function PatientDashboardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-[24px] border border-border/60 p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-4 w-32" />
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-[22px] border border-border/60 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-4 w-48" />
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
