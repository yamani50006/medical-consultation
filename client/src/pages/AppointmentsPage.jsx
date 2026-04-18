import { AlertTriangle, CalendarRange, Edit } from "lucide-react";

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
import {
  deleteDoctorSchedule,
  getDoctorDailyAvailability,
  listDoctors,
  listMyDoctorSchedules,
  setDoctorDailySchedule,
  updateDoctorSchedule
} from "../features/doctors/doctors.api";

import SlotPicker from "../components/appointments/SlotPicker";
import Modal from "../components/ui/Modal";


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
    slotNumber: null,
    notes: ""
  });
  const [scheduleData, setScheduleData] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Doctor schedule management state
  const [numDays, setNumDays] = useState(1);
  const [doctorScheduleForm, setDoctorScheduleForm] = useState([
    { date: "", maxSlots: 10, location: "" }
  ]);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [loadingDoctorSchedules, setLoadingDoctorSchedules] = useState(false);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [editForm, setEditForm] = useState({ maxSlots: 10, location: "" });
  const [isUpdating, setIsUpdating] = useState(false);



  useEffect(() => {
    const total = parseInt(numDays) || 1;
    setDoctorScheduleForm((prev) => {
      const next = [...prev];
      if (next.length < total) {
        for (let i = next.length; i < total; i++) {
          next.push({ date: "", maxSlots: 10, location: "" });
        }
      } else if (next.length > total) {
        return next.slice(0, total);
      }
      return next;
    });
  }, [numDays]);

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
        const [appointmentsResponse, schedulesResponse] = await Promise.all([
          listDoctorAppointments({ page: 1, limit: 50 }),
          listMyDoctorSchedules()
        ]);
        startTransition(() => {
          setAppointments(appointmentsResponse.data.data);
          setDoctorSchedules(schedulesResponse.data.data);
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

  useEffect(() => {
    const fetchAvailability = async () => {
      if (isPatient && form.doctorId && form.appointmentDate) {
        setLoadingSchedule(true);
        try {
          const response = await getDoctorDailyAvailability(form.doctorId, form.appointmentDate);
          setScheduleData(response.data.data);
        } catch (err) {
          console.error("Failed to fetch availability", err);
          setScheduleData(null);
        } finally {
          setLoadingSchedule(false);
        }
      } else {
        setScheduleData(null);
      }
    };

    fetchAvailability();
  }, [form.doctorId, form.appointmentDate, isPatient]);

  const handleBook = async (event) => {
    event.preventDefault();
    if (scheduleData && !form.slotNumber) {
      setError("يرجى اختيار خانة حجز متاحة.");
      return;
    }

    setError("");
    try {
      await bookAppointment({
        ...form,
        appointmentDate: new Date(form.appointmentDate).toISOString()
      });
      setForm({ doctorId: "", appointmentDate: "", slotNumber: null, notes: "" });
      setScheduleData(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر حجز الموعد."));
    }
  };

  const handleSetDoctorSchedule = async (event) => {
    event.preventDefault();
    setSavingSchedule(true);
    setError("");
    try {
      const payload = doctorScheduleForm.map((s) => ({
        ...s,
        date: new Date(s.date).toISOString()
      }));

      await setDoctorDailySchedule(payload);
      setNumDays(1);
      setDoctorScheduleForm([{ date: "", maxSlots: 10, location: "" }]);
      await loadData(); // Refresh list
      alert("تم تحديث الجدول بنجاح لجميع الأيام المحددة");
    } catch (err) {
      setError(getErrorMessage(err, "تعذر حفظ الجدول."));
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleDeleteClick = (schedule) => {
    setActiveSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!activeSchedule) return;
    setIsUpdating(true);
    setError("");
    try {
      await deleteDoctorSchedule(activeSchedule.id);
      setIsDeleteModalOpen(false);
      setActiveSchedule(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر حذف الجدول."));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditClick = (schedule) => {
    setActiveSchedule(schedule);
    setEditForm({
      maxSlots: schedule.maxSlots,
      location: schedule.location
    });
    setIsEditModalOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!activeSchedule) return;
    setIsUpdating(true);
    setError("");
    try {
      await updateDoctorSchedule(activeSchedule.id, editForm);
      setIsEditModalOpen(false);
      setActiveSchedule(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحديث الجدول."));
    } finally {
      setIsUpdating(false);
    }
  };



  const updateDaySchedule = (index, field, value) => {
    setDoctorScheduleForm((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
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
                onChange={(e) => setForm((prev) => ({ ...prev, doctorId: e.target.value, slotNumber: null }))}
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
                label="تاريخ الموعد"
                type="date"
                value={form.appointmentDate}
                onChange={(e) => setForm((prev) => ({ ...prev, appointmentDate: e.target.value, slotNumber: null }))}
                required
              />

              {loadingSchedule && (
                <div className="md:col-span-2 py-4 text-center text-sm text-muted-foreground">
                  جاري تحميل الخانات المتاحة...
                </div>
              )}

              {scheduleData?.schedule && (
                <div className="md:col-span-2 space-y-4">
                  <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
                    <p className="text-sm font-medium text-primary">
                      📍 موقع الدوام: {scheduleData.schedule.location}
                    </p>
                  </div>
                  <SlotPicker
                    maxSlots={scheduleData.schedule.maxSlots}
                    bookedSlotNumbers={scheduleData.bookedSlotNumbers}
                    selectedSlot={form.slotNumber}
                    onSelect={(slot) => setForm((prev) => ({ ...prev, slotNumber: slot }))}
                  />
                </div>
              )}

              {form.appointmentDate && !loadingSchedule && !scheduleData?.schedule && (
                <div className="md:col-span-2 py-4">
                  <p className="text-sm text-amber-600 bg-amber-50 rounded-xl p-4 border border-amber-100">
                    ⚠️ هذا الطبيب لم يقم بتحديد جدول لهذا اليوم بعد. يرجى اختيار تاريخ آخر أو طبيب آخر.
                  </p>
                </div>
              )}

              <div className="md:col-span-2">
                <Input
                  label="ملاحظات"
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" variant="primary" size="lg" disabled={scheduleData && !form.slotNumber}>
                  <CalendarRange className="size-4" />
                  حجز الموعد
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-[34px] border-primary/20 bg-primary/[0.02]">
          <CardContent className="p-8">
            <div className="mb-6">
              <h3 className="text-xl font-display font-semibold text-primary">إعداد جدول الدوام المتعدد</h3>
              <p className="text-sm text-muted-foreground mt-1">حدد عدد الحجوزات المتاحة وموقع عملك لعدة أيام.</p>
            </div>
            
            <form className="space-y-8" onSubmit={handleSetDoctorSchedule}>
              <div className="w-full max-w-xs">
                <Input
                  label="عدد الأيام المراد جدولتها"
                  type="number"
                  min="1"
                  max="14"
                  value={numDays}
                  onChange={(e) => setNumDays(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-6">
                {doctorScheduleForm.map((day, index) => (
                  <div key={index} className="grid gap-4 rounded-2xl border border-border/60 bg-card p-5 md:grid-cols-3">
                    <div className="md:col-span-3 pb-1 border-b border-border/40 mb-2">
                      <span className="text-sm font-semibold text-primary">اليوم {index + 1}</span>
                    </div>
                    <Input
                      label="التاريخ"
                      type="date"
                      value={day.date}
                      onChange={(e) => updateDaySchedule(index, "date", e.target.value)}
                      required
                    />
                    <Input
                      label="عدد الخانات"
                      type="number"
                      min="1"
                      max="50"
                      value={day.maxSlots}
                      onChange={(e) => updateDaySchedule(index, "maxSlots", e.target.value)}
                      required
                    />
                    <Input
                      label="موقع الدوام"
                      placeholder="مثلاً: المستشفى التخصصي"
                      value={day.location}
                      onChange={(e) => updateDaySchedule(index, "location", e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button type="submit" variant="primary" size="lg" loading={savingSchedule}>
                  حفظ إعدادات الجدول ({numDays} أيام)
                </Button>
              </div>
            </form>

            {doctorSchedules.length > 0 && (
              <div className="mt-12 space-y-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <h3 className="text-xl font-display font-semibold text-primary">جداول دوامي المحفوظة</h3>
                  <Badge variant="secondary">{doctorSchedules.length} أيام</Badge>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {doctorSchedules.map((schedule) => (
                    <div key={schedule.id} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-white/50 p-5 transition-all hover:border-primary/30 hover:shadow-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-lg font-bold">
                            {new Date(schedule.date).toLocaleDateString("ar-EG", { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                          <p className="text-sm font-medium text-primary">
                            📍 {schedule.location}
                          </p>
                        </div>
                        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button 
                            onClick={() => handleEditClick(schedule)}
                            className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                            title="تعديل"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(schedule)}
                            className="flex size-8 items-center justify-center rounded-full bg-danger/10 text-danger transition-colors hover:bg-danger hover:text-white"
                            title="إلغاء هذا اليوم"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <span>إجمالي الخانات</span>
                        <span className="text-base font-bold text-foreground">{schedule.maxSlots}</span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/40 to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد الحذف"
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-danger/10 text-danger text-center">
            <AlertTriangle className="size-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold">هل أنت متأكد؟</h3>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              سيتم حذف جدول يوم <span className="font-bold text-foreground">{activeSchedule && new Date(activeSchedule.date).toLocaleDateString("ar-EG", { weekday: 'long', day: 'numeric', month: 'long' })}</span>. لن يتمكن المرضى من رؤية هذا اليوم في قائمة الحجوزات.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="danger" className="flex-1" onClick={confirmDelete} loading={isUpdating}>
              تأكيد الحذف
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
              تراجع
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Schedule Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل جدول الدوام"
      >
        <form onSubmit={submitEdit} className="space-y-6">
          <div className="space-y-4">
            <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
              <p className="text-sm font-medium text-primary">
                تعديل جدول يوم: {activeSchedule && new Date(activeSchedule.date).toLocaleDateString("ar-EG", { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            
            <Input
              label="عدد الخانات"
              type="number"
              min="1"
              max="50"
              value={editForm.maxSlots}
              onChange={(e) => setEditForm(prev => ({ ...prev, maxSlots: e.target.value }))}
              required
            />
            <Input
              label="موقع الدوام"
              value={editForm.location}
              onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" className="flex-1" loading={isUpdating}>
              حفظ التعديلات
            </Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsEditModalOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>





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
