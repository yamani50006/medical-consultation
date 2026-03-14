import { CalendarRange } from "lucide-react";
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
import {
  bookAppointment,
  listDoctorAppointments,
  listMyAppointments,
  updateAppointmentStatus
} from "../features/appointments/appointments.api";
import { listDoctors } from "../features/doctors/doctors.api";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../utils/error";
import { formatStatus, getStatusBadgeVariant } from "../utils/status";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const isPatient = user?.role === "PATIENT";
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    doctorId: "",
    appointmentDate: "",
    notes: ""
  });

  const loadData = async () => {
    setError("");
    setLoading(true);
    try {
      if (isPatient) {
        const [appointmentsResponse, doctorsResponse] = await Promise.all([
          listMyAppointments({ page: 1, limit: 50 }),
          listDoctors({ page: 1, limit: 100 })
        ]);
        startTransition(() => {
          setAppointments(appointmentsResponse.data.data);
          setDoctors(doctorsResponse.data.data);
        });
      } else {
        const response = await listDoctorAppointments({ page: 1, limit: 50 });
        startTransition(() => {
          setAppointments(response.data.data);
        });
      }
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل المواعيد."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isPatient]);

  const handleBook = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await bookAppointment({
        ...form,
        appointmentDate: new Date(form.appointmentDate).toISOString()
      });
      setForm({ doctorId: "", appointmentDate: "", notes: "" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر حجز الموعد."));
    }
  };

  const handleStatusChange = async (id, status) => {
    setError("");
    try {
      await updateAppointmentStatus(id, { status });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحديث الحالة."));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge={isPatient ? "جدول المريض" : "جدول الطبيب"}
        title="المواعيد"
        subtitle={
          isPatient
            ? "احجز موعدك مع طبيب معتمد وتابع جدولك بسهولة."
            : "أدر قائمة المواعيد الخاصة بك مع تحديثات حالة واضحة."
        }
      />

      {isPatient ? (
        <Card className="rounded-[34px]">
          <CardContent className="p-8">
            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleBook}>
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
                label="تاريخ ووقت الموعد"
                type="datetime-local"
                value={form.appointmentDate}
                onChange={(e) => setForm((prev) => ({ ...prev, appointmentDate: e.target.value }))}
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="ملاحظات"
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" variant="primary" size="lg">
                  <CalendarRange className="size-4" />
                  حجز الموعد
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <FormError message={error} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[30px] border border-border/60 p-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-4 h-4 w-24" />
                <Skeleton className="mt-5 h-20 w-full" />
              </div>
            ))
          : appointments.map((item, index) => (
              <AnimatedCard key={item.id} index={index} className="rounded-[30px]">
                <div className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold">
                        {new Date(item.appointmentDate).toLocaleString("ar-EG")}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isPatient ? `الطبيب: ${item.doctor?.user?.fullName}` : `المريض: ${item.patient?.user?.fullName}`}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(item.status)}>{formatStatus(item.status)}</Badge>
                  </div>

                  <p className="text-sm leading-7 text-muted-foreground">
                    {item.notes || "لا توجد ملاحظات إضافية مرتبطة بهذا الموعد."}
                  </p>

                  {!isPatient ? (
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" onClick={() => handleStatusChange(item.id, "scheduled")}>
                        مجدول
                      </Button>
                      <Button type="button" variant="primary" onClick={() => handleStatusChange(item.id, "completed")}>
                        مكتمل
                      </Button>
                      <Button type="button" variant="danger" onClick={() => handleStatusChange(item.id, "cancelled")}>
                        ملغي
                      </Button>
                    </div>
                  ) : null}
                </div>
              </AnimatedCard>
            ))}
      </div>

      {!loading && appointments.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-border/70 bg-card/40 px-6 py-10 text-center text-muted-foreground">
          لا توجد مواعيد حالياً.
        </div>
      ) : null}
    </div>
  );
}
