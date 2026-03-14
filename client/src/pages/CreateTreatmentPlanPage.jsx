import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import { listDoctorAppointments } from "../features/appointments/appointments.api";
import { listAssignedConsultations } from "../features/consultations/consultations.api";
import { addMedications } from "../features/medications/medications.api";
import { createTreatmentPlan } from "../features/treatmentPlans/treatmentPlans.api";
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

export default function CreateTreatmentPlanPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patientId: "",
    consultationId: "",
    title: "",
    diagnosisSummary: "",
    instructions: "",
    startDate: "",
    endDate: ""
  });
  const [medications, setMedications] = useState([createMedicationRow()]);
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadSources = async () => {
      setLoading(true);
      setError("");

      try {
        const [consultationsResponse, appointmentsResponse] = await Promise.all([
          listAssignedConsultations({ page: 1, limit: 100 }),
          listDoctorAppointments({ page: 1, limit: 100 })
        ]);
        const consultationItems = consultationsResponse.data.data.filter((item) =>
          ["ACCEPTED", "COMPLETED"].includes(item.status)
        );
        const appointmentItems = appointmentsResponse.data.data;
        const patientMap = new Map();

        [...consultationItems, ...appointmentItems].forEach((item) => {
          if (item.patient?.id) {
            patientMap.set(item.patient.id, {
              id: item.patient.id,
              fullName: item.patient.user?.fullName
            });
          }
        });

        if (!cancelled) {
          setConsultations(consultationItems);
          setPatients(Array.from(patientMap.values()));
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "تعذر تحميل بيانات المرضى والاستشارات."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSources();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredConsultations = useMemo(
    () =>
      consultations.filter((item) => !form.patientId || item.patientId === form.patientId),
    [consultations, form.patientId]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await createTreatmentPlan({
        ...form,
        consultationId: form.consultationId || undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString()
      });
      const treatmentPlanId = response.data.data.id;
      const validMedications = medications.filter(
        (item) => item.medicationName && item.dosage && item.frequency && item.durationInDays
      );

      if (validMedications.length) {
        await addMedications(treatmentPlanId, {
          items: validMedications.map((item) => ({
            medicationName: item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            durationInDays: Number(item.durationInDays),
            notes: item.notes || undefined
          }))
        });
      }

      navigate(`/doctor/treatment-plans/${treatmentPlanId}`);
    } catch (err) {
      setError(getErrorMessage(err, "تعذر إنشاء الخطة العلاجية."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="إعداد الطبيب"
        title="إنشاء خطة علاجية"
        subtitle="أنشئ خطة رعاية منظمة بعد الاستشارة أو الموعد، وأضف الأدوية المبدئية المرتبطة بها."
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <SectionCard
          title="السياق السريري"
          subtitle="اختر المريض، واربط الخطة اختيارياً باستشارة مقبولة أو مكتملة."
          action={
            <Button asChild variant="ghost">
              <Link to="/doctor/treatment-plans">العودة إلى الخطط</Link>
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="المريض"
              value={form.patientId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  patientId: event.target.value,
                  consultationId: ""
                }))
              }
              disabled={loading}
              required
            >
              <option value="">اختر المريض</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName}
                </option>
              ))}
            </Select>
            <Select
              label="الاستشارة المرتبطة (اختياري)"
              value={form.consultationId}
              onChange={(event) => setForm((current) => ({ ...current, consultationId: event.target.value }))}
              disabled={loading}
            >
              <option value="">غير مرتبطة</option>
              {filteredConsultations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.patient?.user?.fullName} - {item.subject}
                </option>
              ))}
            </Select>
          </div>
        </SectionCard>

        <SectionCard title="تفاصيل الخطة" subtitle="حدد ملخص التشخيص والتعليمات ومدة الخطة العلاجية.">
          <div className="grid gap-4">
            <Input
              label="العنوان"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
            <Textarea
              label="ملخص التشخيص"
              value={form.diagnosisSummary}
              onChange={(event) =>
                setForm((current) => ({ ...current, diagnosisSummary: event.target.value }))
              }
              required
            />
            <Textarea
              label="التعليمات"
              value={form.instructions}
              onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))}
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="تاريخ البداية"
                type="date"
                value={form.startDate}
                onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                required
              />
              <Input
                label="تاريخ النهاية"
                type="date"
                value={form.endDate}
                onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                required
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="الأدوية"
          subtitle="أضف دواءً واحداً أو أكثر داخل هذه الخطة العلاجية."
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
                {medications.length > 1 ? (
                  <Button
                    type="button"
                    className="mt-4"
                    variant="ghost"
                    onClick={() =>
                      setMedications((current) => current.filter((row) => row.localId !== item.localId))
                    }
                  >
                    <Trash2 className="size-4" />
                    إزالة الدواء
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting || loading}>
            {submitting ? "جارٍ الإنشاء..." : "إنشاء الخطة العلاجية"}
          </Button>
          <Button asChild type="button" variant="secondary">
            <Link to="/doctor/treatment-plans">إلغاء</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
