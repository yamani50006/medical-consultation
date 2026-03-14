import { CalendarDays, ClipboardPlus, FileText, ShieldCheck, UserRound } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedCard from "../components/shared/AnimatedCard";
import DashboardWidget from "../components/shared/DashboardWidget";
import PageHeader from "../components/shared/PageHeader";
import RevealSection from "../components/shared/RevealSection";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { listAllConsultations, listPendingDoctors, listUsers } from "../features/admin/admin.api";
import { listDoctorAppointments, listMyAppointments } from "../features/appointments/appointments.api";
import { listAssignedConsultations, listMyConsultations } from "../features/consultations/consultations.api";
import { listMyPosts } from "../features/posts/posts.api";
import useAuth from "../hooks/useAuth";
import { formatRole } from "../utils/status";

const roleCopy = {
  ADMIN: "متابعة شاملة للمنصة مع مراجعة الأطباء وإدارة العمليات الأساسية.",
  DOCTOR: "إدارة المنشورات الطبية والرد على الاستشارات ومتابعة المواعيد.",
  PATIENT: "متابعة الاستشارات والمواعيد والوصول إلى المحتوى الطبي التوعوي."
};

function buildPatientWidgets(state) {
  return [
    {
      title: "الاستشارات",
      value: state.consultations,
      subtitle: "عدد طلبات الاستشارة المرسلة من حسابك.",
      badge: "مريض",
      accent: "linear-gradient(90deg, #22d3ee, #14b8a6)",
      series: [24, 42, 54, 48, 66]
    },
    {
      title: "المواعيد",
      value: state.appointments,
      subtitle: "المواعيد الحالية والسابقة المرتبطة بحسابك.",
      badge: "الجدول",
      accent: "linear-gradient(90deg, #2dd4bf, #0ea5e9)",
      series: [18, 36, 28, 44, 52]
    }
  ];
}

function buildDoctorWidgets(state) {
  return [
    {
      title: "المنشورات",
      value: state.posts,
      subtitle: "المحتوى الطبي الذي أنشأته من مساحة الطبيب.",
      badge: "الاستوديو",
      accent: "linear-gradient(90deg, #14b8a6, #06b6d4)",
      series: [22, 34, 50, 64, 72]
    },
    {
      title: "الاستشارات المسندة",
      value: state.consultations,
      subtitle: "طلبات المرضى التي تنتظر المتابعة والرد.",
      badge: "الوارد",
      accent: "linear-gradient(90deg, #22c55e, #14b8a6)",
      series: [26, 44, 30, 58, 74]
    },
    {
      title: "المواعيد",
      value: state.appointments,
      subtitle: "المواعيد المرتبطة بملفك الطبي حاليًا.",
      badge: "التقويم",
      accent: "linear-gradient(90deg, #06b6d4, #38bdf8)",
      series: [16, 28, 42, 56, 62]
    }
  ];
}

function buildAdminWidgets(state) {
  return [
    {
      title: "طلبات معلقة",
      value: state.pendingDoctors,
      subtitle: "حسابات الأطباء بانتظار المراجعة.",
      badge: "الإدارة",
      accent: "linear-gradient(90deg, #f59e0b, #f97316)",
      series: [22, 26, 40, 46, 58]
    },
    {
      title: "المستخدمون",
      value: state.users,
      subtitle: "جميع الحسابات المسجلة في المنصة.",
      badge: "الوصول",
      accent: "linear-gradient(90deg, #14b8a6, #22d3ee)",
      series: [34, 48, 62, 74, 88]
    },
    {
      title: "الاستشارات",
      value: state.consultations,
      subtitle: "إجمالي نشاط الاستشارات على مستوى المنصة.",
      badge: "التدفق",
      accent: "linear-gradient(90deg, #0ea5e9, #6366f1)",
      series: [16, 32, 54, 68, 86]
    }
  ];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        if (user?.role === "PATIENT") {
          const [consultationsResponse, appointmentsResponse] = await Promise.all([
            listMyConsultations({ page: 1, limit: 1 }),
            listMyAppointments({ page: 1, limit: 1 })
          ]);

          if (!cancelled) {
            startTransition(() => {
              setWidgets(
                buildPatientWidgets({
                  consultations: consultationsResponse.data.meta?.total || 0,
                  appointments: appointmentsResponse.data.meta?.total || 0
                })
              );
            });
          }
        }

        if (user?.role === "DOCTOR") {
          const [postsResponse, consultationsResponse, appointmentsResponse] = await Promise.all([
            listMyPosts({ page: 1, limit: 1 }),
            listAssignedConsultations({ page: 1, limit: 1 }),
            listDoctorAppointments({ page: 1, limit: 1 })
          ]);

          if (!cancelled) {
            startTransition(() => {
              setWidgets(
                buildDoctorWidgets({
                  posts: postsResponse.data.meta?.total || 0,
                  consultations: consultationsResponse.data.meta?.total || 0,
                  appointments: appointmentsResponse.data.meta?.total || 0
                })
              );
            });
          }
        }

        if (user?.role === "ADMIN") {
          const [pendingResponse, usersResponse, consultationsResponse] = await Promise.all([
            listPendingDoctors({ page: 1, limit: 1 }),
            listUsers({ page: 1, limit: 1 }),
            listAllConsultations({ page: 1, limit: 1 })
          ]);

          if (!cancelled) {
            startTransition(() => {
              setWidgets(
                buildAdminWidgets({
                  pendingDoctors: pendingResponse.data.meta?.total || 0,
                  users: usersResponse.data.meta?.total || 0,
                  consultations: consultationsResponse.data.meta?.total || 0
                })
              );
            });
          }
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

  const quickActions = [
    {
      title: "المنشورات الطبية",
      description: "استعرض المنشورات الطبية المنشورة من الأطباء المعتمدين.",
      to: "/posts",
      icon: FileText
    },
    user?.role === "DOCTOR"
      ? {
          title: "استوديو الطبيب",
          description: "أنشئ أو عدّل المحتوى الطبي التوعوي الخاص بك.",
          to: "/doctor-posts",
          icon: ClipboardPlus
        }
      : null,
    user?.role !== "ADMIN"
      ? {
          title: "المواعيد",
          description: "راجع مواعيدك وحالاتها الحالية بسهولة.",
          to: "/appointments",
          icon: CalendarDays
        }
      : null,
    user?.role === "ADMIN"
      ? {
          title: "اعتماد الأطباء",
          description: "راجع حسابات الأطباء المعلقة ومنح الموافقة.",
          to: "/admin/pending-doctors",
          icon: ShieldCheck
        }
      : null,
    user?.role === "PATIENT"
      ? {
          title: "الاستشارات",
          description: "أرسل طلب استشارة جديد إلى طبيب معتمد.",
          to: "/consultations",
          icon: UserRound
        }
      : null
  ].filter(Boolean);

  return (
    <div className="space-y-10">
      <PageHeader
        badge={`مساحة ${formatRole(user?.role) || "المستخدم"}`}
        title={`لوحة ${formatRole(user?.role) || "المستخدم"}`}
        subtitle={roleCopy[user?.role] || "الوصول السريع إلى وظائف الحساب الأساسية."}
      />

      <RevealSection className="grid gap-4 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[30px] border border-border/60 p-6">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-5 h-10 w-24" />
                <Skeleton className="mt-6 h-20 w-full" />
              </div>
            ))
          : widgets.map((widget, index) => <DashboardWidget key={widget.title} index={index} {...widget} />)}
      </RevealSection>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <AnimatedCard className="rounded-[32px]">
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <p className="text-sm text-primary">لوحة الوصول</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight">وحدات سريعة</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.to}
                    className="rounded-[26px] border border-border/60 bg-secondary/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-secondary"
                  >
                    <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold">{action.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="rounded-[32px]">
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <p className="text-sm text-primary">مؤشرات الواجهة</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight">حالة التجربة</h2>
            </div>

            <div className="space-y-4">
              {[
                { label: "أداء الصفحات", value: "سريع", width: "92%" },
                { label: "جودة الواجهة", value: "احترافية", width: "88%" },
                { label: "وضوح التدفقات", value: "منظم", width: "94%" }
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button asChild size="lg">
              <Link to="/posts">فتح موجز المحتوى الطبي</Link>
            </Button>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}
