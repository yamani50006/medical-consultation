import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminActionDialog from "../components/admin/AdminActionDialog";
import AdminStatCard from "../components/admin/AdminStatCard";
import EmptyState from "../components/shared/EmptyState";
import LoadingState from "../components/shared/LoadingState";
import PageHeader from "../components/shared/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useAdminDoctorDetails } from "../hooks/useAdminDoctorDetails";
import { useAdminSectionAnimation } from "../hooks/useAdminSectionAnimation";
import { buildDoctorLocation, formatLastActivity, formatMetric, formatPercentage } from "../utils/admin";
import { formatDateTime } from "../utils/date";
import { formatStatus } from "../utils/status";

export default function AdminDoctorDetailsPage() {
  const { id } = useParams();
  const { doctor, performance, loading, saving, error, updateBasicInfo, suspendDoctor, reactivateDoctor, verifyDoctor, softDeleteDoctor, sendWarning } =
    useAdminDoctorDetails(id);
  const [dialogType, setDialogType] = useState("");
  const [formState, setFormState] = useState({
    fullName: "",
    specialization: "",
    city: "",
    region: "",
    bio: "",
    consultationFee: "",
    yearsOfExperience: ""
  });
  const animationRef = useAdminSectionAnimation([loading, saving, doctor?.id, performance?.doctor?.id]);

  useEffect(() => {
    if (!doctor) {
      return;
    }

    setFormState({
      fullName: doctor.fullName || "",
      specialization: doctor.specialization || "",
      city: doctor.city || "",
      region: doctor.region || "",
      bio: doctor.bio || "",
      consultationFee: doctor.consultationFee ?? "",
      yearsOfExperience: doctor.yearsOfExperience ?? ""
    });
  }, [doctor]);

  if (loading) {
    return <LoadingState rows={5} />;
  }

  if (!doctor || !performance) {
    return <EmptyState title="تعذر العثور على الطبيب" description="الطبيب المطلوب غير متوفر أو تم حذفه." />;
  }

  const metrics = performance.metrics;
  const comparison = performance.comparison;
  const isSuspended = doctor.accountStatus === "SUSPENDED";

  return (
    <div ref={animationRef} className="space-y-8">
      <PageHeader
        badge="Doctor Detail"
        title={doctor.fullName}
        subtitle={`${doctor.specialization} • ${buildDoctorLocation(doctor)} • آخر نشاط: ${formatLastActivity(doctor.lastActivityAt)}`}
      />

      {error ? (
        <div className="rounded-[24px] border border-destructive/20 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="secondary">
          <Link to="/admin/doctors">العودة إلى إدارة الأطباء</Link>
        </Button>
        {!doctor.isVerified ? (
          <Button type="button" onClick={() => verifyDoctor()} disabled={saving}>
            توثيق الطبيب
          </Button>
        ) : null}
        {isSuspended ? (
          <Button type="button" variant="secondary" onClick={() => setDialogType("reactivate")} disabled={saving}>
            إعادة التفعيل
          </Button>
        ) : (
          <Button type="button" variant="danger" onClick={() => setDialogType("suspend")} disabled={saving}>
            إيقاف الطبيب
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => setDialogType("warning")} disabled={saving}>
          إرسال تنبيه
        </Button>
        <Button type="button" variant="ghost" onClick={() => setDialogType("delete")} disabled={saving}>
          حذف منطقي
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="إجمالي الاستشارات" value={metrics.totalConsultations} />
        <AdminStatCard title="استشارات هذا الأسبوع" value={metrics.consultationsThisWeek} />
        <AdminStatCard title="المرضى الفريدون" value={metrics.uniquePatients} />
        <AdminStatCard title="متوسط التقييم" value={metrics.averageRating} />
        <AdminStatCard title="متوسط زمن الرد" value={metrics.averageResponseMinutes} subtitle="بالدقائق" tone="warning" />
        <AdminStatCard title="المواعيد القادمة" value={metrics.upcomingAppointments} />
        <AdminStatCard title="الاستشارات الملغاة" value={metrics.cancelledConsultations} tone="danger" />
        <AdminStatCard title="الاستشارات الجارية" value={metrics.activeConsultations} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card data-admin-animate="card" className="border-white/30 bg-card/45 dark:border-white/10 dark:bg-card/35">
          <CardHeader>
            <CardTitle>تحرير البيانات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Input label="اسم الطبيب" value={formState.fullName} onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))} />
            <Input label="التخصص" value={formState.specialization} onChange={(event) => setFormState((current) => ({ ...current, specialization: event.target.value }))} />
            <Input label="المدينة" value={formState.city} onChange={(event) => setFormState((current) => ({ ...current, city: event.target.value }))} />
            <Input label="المنطقة" value={formState.region} onChange={(event) => setFormState((current) => ({ ...current, region: event.target.value }))} />
            <Input
              label="رسوم الاستشارة"
              type="number"
              value={formState.consultationFee}
              onChange={(event) => setFormState((current) => ({ ...current, consultationFee: event.target.value }))}
            />
            <Input
              label="سنوات الخبرة"
              type="number"
              value={formState.yearsOfExperience}
              onChange={(event) => setFormState((current) => ({ ...current, yearsOfExperience: event.target.value }))}
            />
            <div className="md:col-span-2">
              <Textarea label="نبذة الطبيب" rows={6} value={formState.bio} onChange={(event) => setFormState((current) => ({ ...current, bio: event.target.value }))} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button
                type="button"
                onClick={() =>
                  updateBasicInfo({
                    ...formState,
                    consultationFee: formState.consultationFee === "" ? null : Number(formState.consultationFee),
                    yearsOfExperience: Number(formState.yearsOfExperience || 0)
                  })
                }
                disabled={saving}
              >
                حفظ التعديلات
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card data-admin-animate="card" className="border-white/30 bg-card/45 dark:border-white/10 dark:bg-card/35">
          <CardHeader>
            <CardTitle>مقارنة الأداء الأسبوعي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricLine label="استشارات هذا الأسبوع" value={comparison.currentWeekConsultations} helper={`التغير: ${formatPercentage(comparison.consultationsDeltaPercentage)}`} />
            <MetricLine label="استشارات الأسبوع الماضي" value={comparison.previousWeekConsultations} />
            <MetricLine label="مرضى هذا الأسبوع" value={comparison.currentWeekPatients} helper={`التغير: ${formatPercentage(comparison.patientsDeltaPercentage)}`} />
            <MetricLine label="مرضى الأسبوع الماضي" value={comparison.previousWeekPatients} />
            <MetricLine label="الحالة الحالية" value={formatStatus(doctor.accountStatus)} />
            <MetricLine label="آخر نشاط" value={formatLastActivity(doctor.lastActivityAt)} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card data-admin-animate="card" className="border-white/30 bg-card/45 dark:border-white/10 dark:bg-card/35">
          <CardHeader>
            <CardTitle>سجل الحالة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(doctor.statusHistory || []).map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/20 bg-white/25 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {formatStatus(item.previousUserStatus || "pending")} ← {formatStatus(item.nextUserStatus)}
                  </p>
                  <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.reason || item.note || "لا توجد ملاحظة"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card data-admin-animate="card" className="border-white/30 bg-card/45 dark:border-white/10 dark:bg-card/35">
          <CardHeader>
            <CardTitle>سجل الإجراءات الإدارية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(doctor.recentActions || []).map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/20 bg-white/25 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{formatStatus(item.action)}</p>
                  <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.note || "بدون ملاحظة إضافية"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <AdminActionDialog
        open={dialogType === "suspend"}
        title="إيقاف الطبيب"
        description="سيُمنع الطبيب من استقبال استشارات جديدة إلى حين إعادة التفعيل."
        confirmLabel="تأكيد الإيقاف"
        confirmVariant="danger"
        requireReason
        onClose={() => setDialogType("")}
        onConfirm={async (payload) => {
          await suspendDoctor(payload);
          setDialogType("");
        }}
      />

      <AdminActionDialog
        open={dialogType === "reactivate"}
        title="إعادة تفعيل الطبيب"
        description="سيعود الطبيب إلى استقبال الاستشارات الجديدة بشكل فوري."
        confirmLabel="إعادة التفعيل"
        onClose={() => setDialogType("")}
        onConfirm={async (payload) => {
          await reactivateDoctor(payload);
          setDialogType("");
        }}
      />

      <AdminActionDialog
        open={dialogType === "warning"}
        title="تنبيه إداري"
        description="سيتم إرسال رسالة مباشرة للطبيب مع حفظها في سجل الإدارة."
        confirmLabel="إرسال"
        includeTitle
        onClose={() => setDialogType("")}
        onConfirm={async (payload) => {
          await sendWarning(payload);
          setDialogType("");
        }}
      />

      <AdminActionDialog
        open={dialogType === "delete"}
        title="حذف منطقي"
        description="سيتم تعطيل الطبيب تشغيليًا مع الاحتفاظ بجميع بياناته وسجلاته."
        confirmLabel="تنفيذ الحذف المنطقي"
        confirmVariant="danger"
        requireReason
        onClose={() => setDialogType("")}
        onConfirm={async (payload) => {
          await softDeleteDoctor(payload);
          setDialogType("");
        }}
      />
    </div>
  );
}

function MetricLine({ label, value, helper }) {
  return (
    <div className="rounded-2xl bg-secondary/45 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-display text-xl font-bold">{typeof value === "number" ? formatMetric(value) : value}</span>
      </div>
      {helper ? <p className="mt-2 text-xs text-primary">{helper}</p> : null}
    </div>
  );
}
