import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import { createFollowUp } from "../features/followUps/followUps.api";
import { getTreatmentPlan } from "../features/treatmentPlans/treatmentPlans.api";
import { getErrorMessage } from "../utils/error";

export default function SubmitFollowUpPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [form, setForm] = useState({
    symptomsStatus: "",
    painLevel: "",
    sideEffects: "",
    notes: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadPlan = async () => {
      try {
        const response = await getTreatmentPlan(id);
        if (!cancelled) {
          setPlan(response.data.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "تعذر تحميل الخطة العلاجية."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPlan();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createFollowUp(id, {
        symptomsStatus: form.symptomsStatus,
        painLevel: form.painLevel === "" ? undefined : Number(form.painLevel),
        sideEffects: form.sideEffects || undefined,
        notes: form.notes || undefined
      });
      navigate(`/patient/treatment-plans/${id}`);
    } catch (err) {
      setError(getErrorMessage(err, "تعذر إرسال المتابعة."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="تحديث المريض"
        title="إرسال متابعة"
        subtitle="سجّل الأعراض ومستوى الألم والآثار الجانبية وملاحظات التعافي للطبيب."
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <SectionCard
        title={loading ? "جارٍ تحميل الخطة العلاجية..." : plan?.title || "الخطة العلاجية"}
        subtitle="سيتمكن طبيبك من مراجعة هذا التحديث من لوحة المتابعات."
        action={
          <Button asChild variant="ghost">
            <Link to={`/patient/treatment-plans/${id}`}>العودة إلى الخطة</Link>
          </Button>
        }
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Textarea
            label="حالة الأعراض"
            value={form.symptomsStatus}
            onChange={(event) => setForm((current) => ({ ...current, symptomsStatus: event.target.value }))}
            placeholder="اشرح كيف تغيّرت الأعراض منذ آخر استشارة."
            required
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="مستوى الألم (0 - 10)"
              type="number"
              min="0"
              max="10"
              value={form.painLevel}
              onChange={(event) => setForm((current) => ({ ...current, painLevel: event.target.value }))}
            />
            <Input
              label="الآثار الجانبية"
              value={form.sideEffects}
              onChange={(event) => setForm((current) => ({ ...current, sideEffects: event.target.value }))}
              placeholder="اختياري"
            />
          </div>
          <Textarea
            label="ملاحظات إضافية"
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            placeholder="تفاصيل اختيارية عن التعافي أو الالتزام بالأدوية أو أي مخاوف."
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "جارٍ الإرسال..." : "إرسال المتابعة"}
            </Button>
            <Button asChild type="button" variant="secondary">
              <Link to={`/patient/treatment-plans/${id}`}>إلغاء</Link>
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
