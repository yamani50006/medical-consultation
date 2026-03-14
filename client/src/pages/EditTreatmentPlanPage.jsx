import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import { addMedications, deleteMedication, updateMedication } from "../features/medications/medications.api";
import { getTreatmentPlan, updateTreatmentPlan } from "../features/treatmentPlans/treatmentPlans.api";
import { toDatetimeLocalValue } from "../utils/date";
import { getErrorMessage } from "../utils/error";

function createMedicationRow() {
  return {
    localId: `${Date.now()}-${Math.random()}`,
    medicationName: "",
    dosage: "",
    frequency: "",
    durationInDays: "",
    notes: ""
  };
}

export default function EditTreatmentPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    diagnosisSummary: "",
    instructions: "",
    startDate: "",
    endDate: "",
    status: "active"
  });
  const [medications, setMedications] = useState([]);
  const [deletedMedicationIds, setDeletedMedicationIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadPlan = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getTreatmentPlan(id);
      const plan = response.data.data;

      setForm({
        title: plan.title,
        diagnosisSummary: plan.diagnosisSummary,
        instructions: plan.instructions,
        startDate: toDatetimeLocalValue(plan.startDate).slice(0, 10),
        endDate: toDatetimeLocalValue(plan.endDate).slice(0, 10),
        status: plan.status.toLowerCase()
      });
      setMedications(
        plan.medications.map((item) => ({
          id: item.id,
          localId: item.id,
          medicationName: item.medicationName,
          dosage: item.dosage,
          frequency: item.frequency,
          durationInDays: item.durationInDays.toString(),
          notes: item.notes || ""
        }))
      );
      setDeletedMedicationIds([]);
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل الخطة العلاجية."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [id]);

  const handleRemoveMedication = (row) => {
    setMedications((current) => current.filter((item) => item.localId !== row.localId));
    if (row.id) {
      setDeletedMedicationIds((current) => [...current, row.id]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await updateTreatmentPlan(id, {
        title: form.title,
        diagnosisSummary: form.diagnosisSummary,
        instructions: form.instructions,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        status: form.status
      });

      const existingRows = medications.filter((item) => item.id);
      const newRows = medications.filter((item) => !item.id && item.medicationName);

      await Promise.all(
        existingRows.map((item) =>
          updateMedication(item.id, {
            medicationName: item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            durationInDays: Number(item.durationInDays),
            notes: item.notes || undefined
          })
        )
      );

      if (newRows.length) {
        await addMedications(id, {
          items: newRows.map((item) => ({
            medicationName: item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            durationInDays: Number(item.durationInDays),
            notes: item.notes || undefined
          }))
        });
      }

      if (deletedMedicationIds.length) {
        await Promise.all(deletedMedicationIds.map((medicationId) => deleteMedication(medicationId)));
      }

      navigate(`/doctor/treatment-plans/${id}`);
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحديث الخطة العلاجية."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="إعداد الطبيب"
        title="تعديل الخطة العلاجية"
        subtitle="حدّث حالة الخطة والتعليمات والأدوية المرتبطة بها مع الحفاظ على تزامن البيانات."
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <SectionCard
          title="معلومات الخطة"
          subtitle="حدّث ملخص التشخيص والتعليمات والجدول الزمني والحالة الحالية."
          action={
            <Button asChild variant="ghost">
              <Link to={`/doctor/treatment-plans/${id}`}>العودة إلى الخطة</Link>
            </Button>
          }
        >
          <div className="grid gap-4">
            <Input
              label="العنوان"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              disabled={loading}
            />
            <Textarea
              label="ملخص التشخيص"
              value={form.diagnosisSummary}
              onChange={(event) => setForm((current) => ({ ...current, diagnosisSummary: event.target.value }))}
              disabled={loading}
            />
            <Textarea
              label="التعليمات"
              value={form.instructions}
              onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))}
              disabled={loading}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="تاريخ البداية"
                type="date"
                value={form.startDate}
                onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                disabled={loading}
              />
              <Input
                label="تاريخ النهاية"
                type="date"
                value={form.endDate}
                onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                disabled={loading}
              />
              <Select
                label="الحالة"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                disabled={loading}
              >
                <option value="active">نشطة</option>
                <option value="completed">مكتملة</option>
                <option value="cancelled">ملغاة</option>
              </Select>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="قائمة الأدوية"
          subtitle="حدّث العناصر الحالية، واحذف الأدوية غير المطلوبة، أو أضف وصفات جديدة."
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => setMedications((current) => [...current, createMedicationRow()])}
            >
              <Plus className="size-4" />
              إضافة دواء
            </Button>
          }
        >
          <div className="space-y-4">
            {medications.map((item, index) => (
              <div key={item.localId} className="rounded-[24px] border border-border/60 bg-secondary/35 p-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Input
                    label={`دواء ${index + 1}`}
                    value={item.medicationName}
                    onChange={(event) =>
                      setMedications((current) =>
                        current.map((row) =>
                          row.localId === item.localId ? { ...row, medicationName: event.target.value } : row
                        )
                      )
                    }
                  />
                  <Input
                    label="الجرعة"
                    value={item.dosage}
                    onChange={(event) =>
                      setMedications((current) =>
                        current.map((row) =>
                          row.localId === item.localId ? { ...row, dosage: event.target.value } : row
                        )
                      )
                    }
                  />
                  <Input
                    label="التكرار"
                    value={item.frequency}
                    onChange={(event) =>
                      setMedications((current) =>
                        current.map((row) =>
                          row.localId === item.localId ? { ...row, frequency: event.target.value } : row
                        )
                      )
                    }
                  />
                  <Input
                    label="المدة بالأيام"
                    type="number"
                    min="1"
                    value={item.durationInDays}
                    onChange={(event) =>
                      setMedications((current) =>
                        current.map((row) =>
                          row.localId === item.localId ? { ...row, durationInDays: event.target.value } : row
                        )
                      )
                    }
                  />
                </div>
                <Textarea
                  className="mt-4"
                  label="ملاحظات"
                  value={item.notes}
                  onChange={(event) =>
                    setMedications((current) =>
                      current.map((row) =>
                        row.localId === item.localId ? { ...row, notes: event.target.value } : row
                      )
                    )
                  }
                />
                <Button type="button" className="mt-4" variant="ghost" onClick={() => handleRemoveMedication(item)}>
                  <Trash2 className="size-4" />
                  إزالة الدواء
                </Button>
              </div>
            ))}
            {!medications.length ? (
              <div className="rounded-[24px] border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                لا توجد أدوية حالياً في هذه الخطة. أضف دواءً جديداً للمتابعة.
              </div>
            ) : null}
          </div>
        </SectionCard>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting || loading}>
            {submitting ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </Button>
          <Button asChild type="button" variant="secondary">
            <Link to={`/doctor/treatment-plans/${id}`}>إلغاء</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
