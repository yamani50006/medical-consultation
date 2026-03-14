import { useEffect, useState } from "react";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import Button from "../components/ui/Button";
import Textarea from "../components/ui/Textarea";
import { getMyMedicalRecord, updateMyMedicalRecord } from "../features/medicalRecords/medicalRecords.api";
import { getErrorMessage } from "../utils/error";

export default function MedicalRecordPage() {
  const [form, setForm] = useState({
    allergies: "",
    chronicDiseases: "",
    surgeriesHistory: "",
    familyHistory: "",
    lifestyleNotes: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadRecord = async () => {
      try {
        const response = await getMyMedicalRecord();
        if (!cancelled) {
          const record = response.data.data;
          setForm({
            allergies: record.allergies || "",
            chronicDiseases: record.chronicDiseases || "",
            surgeriesHistory: record.surgeriesHistory || "",
            familyHistory: record.familyHistory || "",
            lifestyleNotes: record.lifestyleNotes || ""
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "تعذر تحميل السجل الطبي."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRecord();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateMyMedicalRecord(form);
      setSuccess("تم تحديث السجل الطبي بنجاح.");
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحديث السجل الطبي."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="سجل المريض"
        title="السجل الطبي"
        subtitle="احتفظ بخلفية صحية منظمة يمكن للأطباء المرتبطين بك مراجعتها أثناء الرعاية."
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {success}
        </div>
      ) : null}

      <SectionCard
        title="الخلفية الصحية"
        subtitle="حدّث هذه البيانات باستمرار حتى تكون الاستشارات والخطط العلاجية أدق وأكثر فائدة."
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Textarea
              label="الحساسية"
              value={form.allergies}
              onChange={(event) => setForm((current) => ({ ...current, allergies: event.target.value }))}
              disabled={loading}
            />
            <Textarea
              label="الأمراض المزمنة"
              value={form.chronicDiseases}
              onChange={(event) => setForm((current) => ({ ...current, chronicDiseases: event.target.value }))}
              disabled={loading}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Textarea
              label="تاريخ العمليات الجراحية"
              value={form.surgeriesHistory}
              onChange={(event) => setForm((current) => ({ ...current, surgeriesHistory: event.target.value }))}
              disabled={loading}
            />
            <Textarea
              label="التاريخ العائلي"
              value={form.familyHistory}
              onChange={(event) => setForm((current) => ({ ...current, familyHistory: event.target.value }))}
              disabled={loading}
            />
          </div>
          <Textarea
            label="ملاحظات نمط الحياة"
            value={form.lifestyleNotes}
            onChange={(event) => setForm((current) => ({ ...current, lifestyleNotes: event.target.value }))}
            disabled={loading}
          />
          <div>
            <Button type="submit" disabled={saving || loading}>
              {saving ? "جارٍ الحفظ..." : "حفظ السجل الطبي"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
