import { useMemo, useState } from "react";
import AdminActionDialog from "../components/admin/AdminActionDialog";
import AdminDoctorsTable from "../components/admin/AdminDoctorsTable";
import AdminFilterBar from "../components/admin/AdminFilterBar";
import AdminStatCard from "../components/admin/AdminStatCard";
import LoadingState from "../components/shared/LoadingState";
import PageHeader from "../components/shared/PageHeader";
import Button from "../components/ui/Button";
import { useAdminDoctorsData } from "../hooks/useAdminDoctorsData";
import { useAdminSectionAnimation } from "../hooks/useAdminSectionAnimation";
import { formatMetric } from "../utils/admin";

export default function AdminDoctorsPage() {
  const {
    filters,
    items,
    meta,
    loading,
    error,
    actionLoadingId,
    setFilters,
    suspendDoctor,
    reactivateDoctor,
    verifyDoctor,
    softDeleteDoctor,
    sendWarning
  } = useAdminDoctorsData();
  const [dialogState, setDialogState] = useState({ type: "", doctor: null });
  const animationRef = useAdminSectionAnimation([loading, items.length, dialogState.type]);

  const specializationOptions = useMemo(
    () => [...new Set(items.map((item) => item.specialization).filter(Boolean))].sort(),
    [items]
  );
  const cityOptions = useMemo(() => [...new Set(items.map((item) => item.city).filter(Boolean))].sort(), [items]);

  const stats = useMemo(
    () => ({
      total: items.length,
      active: items.filter((item) => item.accountStatus === "ACTIVE").length,
      suspended: items.filter((item) => item.accountStatus === "SUSPENDED").length,
      verified: items.filter((item) => item.isVerified).length
    }),
    [items]
  );

  const closeDialog = () => setDialogState({ type: "", doctor: null });

  const handleConfirm = async (payload) => {
    const doctor = dialogState.doctor;
    if (!doctor) {
      return;
    }

    if (dialogState.type === "suspend") {
      await suspendDoctor(doctor.id, payload);
    }

    if (dialogState.type === "reactivate") {
      await reactivateDoctor(doctor.id, payload);
    }

    if (dialogState.type === "delete") {
      await softDeleteDoctor(doctor.id, payload);
    }

    if (dialogState.type === "warning") {
      await sendWarning(doctor.id, payload);
    }

    closeDialog();
  };

  return (
    <div ref={animationRef} className="space-y-8">
      <PageHeader
        badge="Doctors Control"
        title="إدارة الأطباء"
        subtitle="جدول تشغيلي احترافي لإدارة حالة الأطباء، التحقق، الإيقاف، والتنبيهات دون كسر النظام الحالي."
      />

      {error ? (
        <div className="rounded-[24px] border border-destructive/20 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="عدد السجلات الحالية" value={stats.total} subtitle="نتائج الصفحة الحالية" />
        <AdminStatCard title="نشطون" value={stats.active} subtitle="يستقبلون استشارات جديدة" />
        <AdminStatCard title="موقوفون" value={stats.suspended} subtitle="بحاجة لمراجعة أو إعادة تفعيل" tone="danger" />
        <AdminStatCard title="موثقون" value={stats.verified} subtitle="تم اعتمادهم والتحقق منهم" />
      </section>

      <AdminFilterBar
        filters={filters}
        specializationOptions={specializationOptions}
        cityOptions={cityOptions}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }))}
        onReset={() =>
          setFilters({
            page: 1,
            limit: 12,
            search: "",
            status: "",
            specialization: "",
            city: "",
            sortBy: "joinedAt",
            sortOrder: "desc"
          })
        }
      />

      {loading ? (
        <LoadingState rows={4} />
      ) : (
        <>
          <AdminDoctorsTable
            items={items}
            actionLoadingId={actionLoadingId}
            onSuspend={(doctor) => setDialogState({ type: "suspend", doctor })}
            onReactivate={(doctor) => setDialogState({ type: "reactivate", doctor })}
            onVerify={verifyDoctor}
            onDelete={(doctor) => setDialogState({ type: "delete", doctor })}
            onWarn={(doctor) => setDialogState({ type: "warning", doctor })}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[26px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(242,249,250,0.9))] px-4 py-3 text-sm shadow-[0_18px_60px_-50px_rgba(15,23,42,0.3)]">
            <div className="text-slate-500">
              الصفحة {formatMetric(meta?.page || 1)} من {formatMetric(meta?.totalPages || 1)} • إجمالي النتائج {formatMetric(meta?.total || 0)}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
                disabled={!meta?.hasPrevPage}
              >
                السابق
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
                disabled={!meta?.hasNextPage}
              >
                التالي
              </Button>
            </div>
          </div>
        </>
      )}

      <AdminActionDialog
        open={dialogState.type === "suspend"}
        title="إيقاف طبيب"
        description="سيتم منع الطبيب من استقبال استشارات جديدة مع الاحتفاظ بجميع البيانات."
        confirmLabel="تأكيد الإيقاف"
        confirmVariant="danger"
        requireReason
        onClose={closeDialog}
        onConfirm={handleConfirm}
      />

      <AdminActionDialog
        open={dialogState.type === "reactivate"}
        title="إعادة تفعيل طبيب"
        description="سيعود الطبيب لاستقبال الاستشارات الجديدة مع الاحتفاظ بسجل الحالة."
        confirmLabel="إعادة التفعيل"
        onClose={closeDialog}
        onConfirm={handleConfirm}
      />

      <AdminActionDialog
        open={dialogState.type === "delete"}
        title="حذف منطقي للطبيب"
        description="سيتم إخفاء الطبيب تشغيليًا مع الاحتفاظ ببياناته وسجلاته لأغراض التتبع."
        confirmLabel="تنفيذ الحذف المنطقي"
        confirmVariant="danger"
        requireReason
        onClose={closeDialog}
        onConfirm={handleConfirm}
      />

      <AdminActionDialog
        open={dialogState.type === "warning"}
        title="إرسال تنبيه إداري"
        description="إرسال ملاحظة أو تحذير للطبيب مع حفظ العملية في سجل الإدارة."
        confirmLabel="إرسال التنبيه"
        includeTitle
        onClose={closeDialog}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
