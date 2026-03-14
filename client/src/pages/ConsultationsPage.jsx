import { AnimatePresence, motion } from "framer-motion";
import { startTransition, useEffect, useState } from "react";
import FormError from "../components/forms/FormError";
import AnimatedCard from "../components/shared/AnimatedCard";
import PageHeader from "../components/shared/PageHeader";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Skeleton from "../components/ui/Skeleton";
import Textarea from "../components/ui/Textarea";
import {
  createConsultation,
  listAssignedConsultations,
  listMyConsultations,
  respondConsultation,
  updateConsultationStatus
} from "../features/consultations/consultations.api";
import { listDoctors } from "../features/doctors/doctors.api";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../utils/error";
import { formatStatus, getStatusBadgeVariant } from "../utils/status";

export default function ConsultationsPage() {
  const { user } = useAuth();
  const isPatient = user?.role === "PATIENT";
  const [consultations, setConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    doctorId: "",
    subject: "",
    description: ""
  });
  const [responseDrafts, setResponseDrafts] = useState({});

  const loadData = async () => {
    setError("");
    setLoading(true);
    try {
      if (isPatient) {
        const [consultationsResponse, doctorsResponse] = await Promise.all([
          listMyConsultations({ page: 1, limit: 50 }),
          listDoctors({ page: 1, limit: 100 })
        ]);
        startTransition(() => {
          setConsultations(consultationsResponse.data.data);
          setDoctors(doctorsResponse.data.data);
        });
      } else {
        const response = await listAssignedConsultations({ page: 1, limit: 50 });
        startTransition(() => {
          setConsultations(response.data.data);
        });
      }
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل الاستشارات."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isPatient]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await createConsultation(form);
      setForm({ doctorId: "", subject: "", description: "" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر إنشاء طلب الاستشارة."));
    }
  };

  const handleRespond = async (consultationId) => {
    setError("");
    const draft = responseDrafts[consultationId];
    try {
      await respondConsultation(consultationId, {
        doctorResponse: draft?.doctorResponse || "",
        status: draft?.status || "accepted"
      });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر إرسال الرد."));
    }
  };

  const handleStatusUpdate = async (consultationId, status) => {
    setError("");
    try {
      await updateConsultationStatus(consultationId, { status });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحديث الحالة."));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge={isPatient ? "صندوق المريض" : "صندوق الطبيب"}
        title="الاستشارات"
        subtitle={
          isPatient
            ? "أنشئ طلبات الاستشارة وتابعها من خلال واجهة واضحة ومركزة."
            : "راجع الاستشارات المسندة لك ورد عليها ضمن سياق منظم."
        }
      />

      {isPatient ? (
        <Card className="rounded-[34px]">
          <CardContent className="p-8">
            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleCreate}>
              <Select
                label="اختر الطبيب"
                value={form.doctorId}
                onChange={(e) => setForm((prev) => ({ ...prev, doctorId: e.target.value }))}
                required
              >
                <option value="">اختر طبيبًا</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.user.fullName} - {doctor.specialization}
                  </option>
                ))}
              </Select>
              <Input
                label="عنوان الاستشارة"
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                required
              />
              <div className="md:col-span-2">
                <Textarea
                  label="الوصف / الأعراض"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" variant="primary" size="lg">
                  إرسال طلب الاستشارة
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <FormError message={error} />

      <div className="grid gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[30px] border border-border/60 p-6">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="mt-4 h-4 w-40" />
                <Skeleton className="mt-5 h-20 w-full" />
              </div>
            ))
          : consultations.map((item, index) => (
              <AnimatedCard key={item.id} index={index} className="rounded-[30px]">
                <div className="space-y-5 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold">{item.subject}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isPatient ? `الطبيب: ${item.doctor?.user?.fullName}` : `المريض: ${item.patient?.user?.fullName}`}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(item.status)}>{formatStatus(item.status)}</Badge>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${item.id}-${item.status}-${item.doctorResponse || "pending"}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.24 }}
                      className="space-y-3"
                    >
                      <div className="ml-auto max-w-[88%] rounded-[24px] rounded-br-md bg-primary/12 px-4 py-3 text-sm leading-7 text-foreground">
                        {item.description}
                      </div>

                      {item.doctorResponse ? (
                        <div className="max-w-[88%] rounded-[24px] rounded-bl-md bg-secondary px-4 py-3 text-sm leading-7 text-foreground">
                          {item.doctorResponse}
                        </div>
                      ) : (
                        <div className="max-w-[70%] rounded-[24px] rounded-bl-md border border-dashed border-border/70 px-4 py-3 text-sm text-muted-foreground">
                          بانتظار رد الطبيب.
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {!isPatient ? (
                    <div className="grid gap-4 rounded-[26px] border border-border/60 bg-secondary/35 p-4 md:grid-cols-[1fr_auto] md:items-end">
                      <div className="grid gap-4">
                        <Textarea
                          label="رد الطبيب"
                          value={responseDrafts[item.id]?.doctorResponse || ""}
                          onChange={(e) =>
                            setResponseDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...(prev[item.id] || {}), doctorResponse: e.target.value }
                            }))
                          }
                        />
                        <Select
                          label="حالة الرد"
                          value={responseDrafts[item.id]?.status || "accepted"}
                          onChange={(e) =>
                            setResponseDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...(prev[item.id] || {}), status: e.target.value }
                            }))
                          }
                        >
                          <option value="accepted">مقبول</option>
                          <option value="completed">مكتمل</option>
                          <option value="cancelled">ملغي</option>
                        </Select>
                      </div>
                      <div className="flex flex-wrap gap-3 md:flex-col">
                        <Button type="button" variant="primary" onClick={() => handleRespond(item.id)}>
                          إرسال الرد
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => handleStatusUpdate(item.id, "completed")}>
                          تعيين كمكتمل
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </AnimatedCard>
            ))}
      </div>

      {!loading && consultations.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-border/70 bg-card/40 px-6 py-10 text-center text-muted-foreground">
          لا توجد استشارات حالياً.
        </div>
      ) : null}
    </div>
  );
}
