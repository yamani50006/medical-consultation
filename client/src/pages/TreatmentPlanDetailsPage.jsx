import { HeartPulse, PencilLine, PlusCircle } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/shared/EmptyState";
import InfoGrid from "../components/shared/InfoGrid";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import StatusBadge from "../components/shared/StatusBadge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { getTreatmentPlan, updateTreatmentPlan } from "../features/treatmentPlans/treatmentPlans.api";
import useAuth from "../hooks/useAuth";
import { formatDate, formatDateTime } from "../utils/date";
import { getErrorMessage } from "../utils/error";
import { formatStatus } from "../utils/status";

export default function TreatmentPlanDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isPatient = user?.role === "PATIENT";
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const loadPlan = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getTreatmentPlan(id);
      startTransition(() => {
        setPlan(response.data.data);
      });
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل تفاصيل الخطة العلاجية."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [id]);

  const handleStatusChange = async (status) => {
    setUpdating(true);
    setError("");

    try {
      await updateTreatmentPlan(id, { status });
      await loadPlan();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحديث الخطة العلاجية."));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge={isPatient ? "عرض المريض" : "عرض الطبيب"}
        title={plan?.title || "تفاصيل الخطة العلاجية"}
        subtitle={
          isPatient
            ? "راجع ملخص التشخيص والأدوية وآخر ملاحظات المتابعة."
            : "أدر تعليمات الخطة والأدوية وردود متابعة المريض."
        }
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-[30px] border border-border/60 p-6">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-4 h-24 w-full" />
            </div>
          ))}
        </div>
      ) : plan ? (
        <>
          <SectionCard
            title="نظرة عامة على الخطة"
            subtitle={isPatient ? plan.doctor?.user?.fullName : plan.patient?.user?.fullName}
            action={<StatusBadge value={plan.status} />}
          >
            <p className="text-sm leading-7 text-muted-foreground">{plan.instructions}</p>
            <InfoGrid
              items={[
                { label: "التشخيص", value: plan.diagnosisSummary },
                { label: "تاريخ البداية", value: formatDate(plan.startDate) },
                { label: "تاريخ النهاية", value: formatDate(plan.endDate) },
                {
                  label: "الاستشارة",
                  value: plan.consultation
                    ? `${plan.consultation.subject} (${formatStatus(plan.consultation.status)})`
                    : "غير مرتبطة"
                }
              ]}
            />
            <div className="flex flex-wrap gap-3">
              {!isPatient ? (
                <>
                  <Button asChild variant="secondary">
                    <Link to={`/doctor/treatment-plans/${plan.id}/edit`}>
                      <PencilLine className="size-4" />
                      تعديل الخطة
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={updating || plan.status === "COMPLETED"}
                    onClick={() => handleStatusChange("completed")}
                  >
                    تعيين كمكتملة
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    disabled={updating || plan.status === "CANCELLED"}
                    onClick={() => handleStatusChange("cancelled")}
                  >
                    إلغاء الخطة
                  </Button>
                </>
              ) : plan.status === "ACTIVE" ? (
                <Button asChild>
                  <Link to={`/patient/treatment-plans/${plan.id}/follow-up`}>
                    <PlusCircle className="size-4" />
                    إرسال متابعة
                  </Link>
                </Button>
              ) : null}
            </div>
          </SectionCard>

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <SectionCard title="الأدوية" subtitle="الأدوية الموصوفة ضمن هذه الخطة العلاجية.">
              {plan.medications?.length ? (
                plan.medications.map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-border/60 bg-secondary/35 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-semibold">{item.medicationName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.dosage} • {item.frequency}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {item.durationInDays} يوم
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.notes || "لا توجد ملاحظات إضافية على الدواء."}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="لا توجد أدوية مدرجة" description="هذه الخطة لا تحتوي على عناصر دوائية حتى الآن." />
              )}
            </SectionCard>

            <SectionCard title="الخط الزمني للمتابعة" subtitle="تحديثات تقدم المريض وملاحظات الطبيب.">
              {plan.followUps?.length ? (
                plan.followUps.map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-border/60 bg-card/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.patient?.user?.fullName || "تحديث المريض"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                      </div>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                        الألم {item.painLevel ?? "-"} / 10
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7">{item.symptomsStatus}</p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      الآثار الجانبية: {item.sideEffects || "لا يوجد"}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">ملاحظات المريض: {item.notes || "لا توجد ملاحظات إضافية"}</p>
                    {item.doctorNote ? (
                      <div className="mt-4 rounded-[18px] bg-primary/10 px-4 py-3 text-sm text-foreground">
                        ملاحظة الطبيب: {item.doctorNote}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyState
                  title="لا توجد إدخالات متابعة بعد"
                  description="ستظهر تحديثات التقدم هنا بمجرد أن يبدأ المريض في إرسال المتابعات."
                  icon={HeartPulse}
                />
              )}
            </SectionCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
