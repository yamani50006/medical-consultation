import { startTransition, useEffect, useState } from "react";
import AnimatedCard from "../components/shared/AnimatedCard";
import DashboardWidget from "../components/shared/DashboardWidget";
import PageHeader from "../components/shared/PageHeader";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import {
  approveDoctor,
  listAllAppointments,
  listAllConsultations,
  listAllPosts,
  listPendingDoctors,
  listUsers,
  rejectDoctor
} from "../features/admin/admin.api";
import { getErrorMessage } from "../utils/error";
import { formatStatus } from "../utils/status";

export default function AdminPendingDoctorsPage() {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    consultations: 0,
    appointments: 0
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setError("");
    setLoading(true);
    try {
      const [pendingRes, usersRes, postsRes, consultationsRes, appointmentsRes] = await Promise.all([
        listPendingDoctors({ page: 1, limit: 50 }),
        listUsers({ page: 1, limit: 1 }),
        listAllPosts({ page: 1, limit: 1 }),
        listAllConsultations({ page: 1, limit: 1 }),
        listAllAppointments({ page: 1, limit: 1 })
      ]);

      startTransition(() => {
        setPendingDoctors(pendingRes.data.data);
        setStats({
          users: usersRes.data.meta?.total || 0,
          posts: postsRes.data.meta?.total || 0,
          consultations: consultationsRes.data.meta?.total || 0,
          appointments: appointmentsRes.data.meta?.total || 0
        });
      });
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل بيانات الإدارة."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    setError("");
    try {
      await approveDoctor(id);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر اعتماد الطبيب."));
    }
  };

  const handleReject = async (id) => {
    setError("");
    try {
      await rejectDoctor(id, {
        reason: "لم تستوفِ متطلبات الاعتماد الحالية",
        note: "تم الرفض من شاشة المراجعة السريعة."
      });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر رفض الطبيب."));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="لوحة الإدارة"
        title="لوحة تحكم الإدارة"
        subtitle="اعتماد الأطباء المعلقين ومتابعة مؤشرات المنصة من واجهة واضحة."
      />
      {error ? (
        <div className="rounded-[24px] border border-destructive/20 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        {[
          {
            title: "المستخدمون",
            value: stats.users,
            subtitle: "جميع الحسابات المسجلة.",
            accent: "linear-gradient(90deg, #14b8a6, #22d3ee)",
            series: [28, 42, 50, 66, 82]
          },
          {
            title: "المنشورات",
            value: stats.posts,
            subtitle: "المنشورات المنشورة والمسودات.",
            accent: "linear-gradient(90deg, #06b6d4, #38bdf8)",
            series: [18, 32, 46, 60, 68]
          },
          {
            title: "الاستشارات",
            value: stats.consultations,
            subtitle: "نشاط الاستشارات على مستوى المنصة.",
            accent: "linear-gradient(90deg, #22c55e, #14b8a6)",
            series: [24, 30, 48, 62, 86]
          },
          {
            title: "المواعيد",
            value: stats.appointments,
            subtitle: "المواعيد بين الأطباء والمرضى.",
            accent: "linear-gradient(90deg, #f59e0b, #fb7185)",
            series: [12, 28, 40, 58, 70]
          }
        ].map((item, index) =>
          loading ? (
            <div key={item.title} className="rounded-[30px] border border-border/60 p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-5 h-10 w-20" />
              <Skeleton className="mt-6 h-20 w-full" />
            </div>
          ) : (
            <DashboardWidget key={item.title} index={index} {...item} />
          )
        )}
      </div>

      <div className="grid gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[30px] border border-border/60 p-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="mt-4 h-4 w-48" />
                <Skeleton className="mt-5 h-24 w-full" />
              </div>
            ))
          : pendingDoctors.map((doctor, index) => (
              <AnimatedCard key={doctor.id} index={index} className="rounded-[30px]">
                <div className="grid gap-5 p-6 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-2xl font-semibold">{doctor.user.fullName}</h3>
                      <Badge variant="warning">{formatStatus(doctor.approvalStatus)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{doctor.user.email}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>{doctor.specialization}</span>
                      <span>{doctor.yearsOfExperience} سنوات خبرة</span>
                      <span>الترخيص: {doctor.licenseNumber}</span>
                    </div>
                    <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{doctor.bio}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 lg:flex-col">
                    <Button type="button" variant="primary" onClick={() => handleApprove(doctor.id)}>
                      اعتماد
                    </Button>
                    <Button type="button" variant="danger" onClick={() => handleReject(doctor.id)}>
                      رفض
                    </Button>
                  </div>
                </div>
              </AnimatedCard>
            ))}
      </div>

      {!loading && pendingDoctors.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-border/70 bg-card/40 px-6 py-10 text-center text-muted-foreground">
          لا توجد حسابات أطباء معلقة.
        </div>
      ) : null}
    </div>
  );
}
