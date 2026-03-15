import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, LoaderCircle, Sparkles, Wand2 } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import DoctorFiltersPanel from "../components/consultations/DoctorFiltersPanel";
import DoctorRecommendationCard from "../components/consultations/DoctorRecommendationCard";
import SymptomAnalyzerPanel from "../components/consultations/SymptomAnalyzerPanel";
import FormError from "../components/forms/FormError";
import AnimatedCard from "../components/shared/AnimatedCard";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import Skeleton from "../components/ui/Skeleton";
import Textarea from "../components/ui/Textarea";
import { analyzeSymptoms } from "../features/symptoms/symptoms.api";
import {
  listAssignedConsultations,
  listMyConsultations,
  quickMatchConsultation,
  requestConsultation,
  respondConsultation,
  updateConsultationStatus
} from "../features/consultations/consultations.api";
import { getDoctorFilters, getRecommendedDoctors, listDoctors } from "../features/doctors/doctors.api";
import { getMyPatientProfile } from "../features/patients/patients.api";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../utils/error";
import { formatStatus, getStatusBadgeVariant } from "../utils/status";

function createInitialPatientForm() {
  return {
    doctorId: "",
    subject: "",
    description: "",
    symptomsText: "",
    specialization: "",
    city: "",
    region: "",
    consultationMode: "any",
    availableNow: false,
    maxPrice: "",
    sortBy: "best_match"
  };
}

function buildRecommendationParams(form, patientProfile) {
  return {
    specialization: form.specialization || undefined,
    city: form.city || undefined,
    region: form.region || undefined,
    consultationMode: form.consultationMode,
    availableNow: form.availableNow,
    maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
    sortBy: form.sortBy,
    patientCity: patientProfile?.city || undefined,
    patientRegion: patientProfile?.region || undefined,
    symptomsText: form.symptomsText || undefined,
    limit: 3
  };
}

function buildConsultationPayload(form, patientProfile, options = {}) {
  return {
    doctorId: options.doctorId,
    subject: form.subject,
    description: form.description,
    specialization: form.specialization || undefined,
    symptomsText: form.symptomsText || undefined,
    city: form.city || undefined,
    region: form.region || undefined,
    patientCity: patientProfile?.city || undefined,
    patientRegion: patientProfile?.region || undefined,
    consultationMode: form.consultationMode,
    availableNow: form.availableNow,
    maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
    autoAssignDoctor: options.autoAssignDoctor || false
  };
}

export default function ConsultationsWorkspacePage() {
  const { user } = useAuth();
  const isPatient = user?.role === "PATIENT";
  const [consultations, setConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    specializations: [],
    cities: [],
    regions: [],
    priceRange: { min: 0, max: 0 }
  });
  const [recommendations, setRecommendations] = useState([]);
  const [suggestedSpecialties, setSuggestedSpecialties] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [symptomAnalysis, setSymptomAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quickMatchLoading, setQuickMatchLoading] = useState(false);
  const [form, setForm] = useState(createInitialPatientForm);
  const [responseDrafts, setResponseDrafts] = useState({});

  const loadData = async () => {
    setError("");
    setLoading(true);

    try {
      if (isPatient) {
        const [consultationsResponse, doctorsResponse, filtersResponse, patientResponse] = await Promise.all([
          listMyConsultations({ page: 1, limit: 50 }),
          listDoctors({ page: 1, limit: 100 }),
          getDoctorFilters(),
          getMyPatientProfile()
        ]);

        startTransition(() => {
          setConsultations(consultationsResponse.data.data);
          setDoctors(doctorsResponse.data.data);
          setFilterOptions(filtersResponse.data.data);
          setPatientProfile(patientResponse.data.data);
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

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const resetPatientFlow = () => {
    setForm(createInitialPatientForm());
    setRecommendations([]);
    setSuggestedSpecialties([]);
    setSelectedDoctorId("");
    setSymptomAnalysis(null);
  };

  const handleAnalyzeSymptoms = async () => {
    setAnalyzeLoading(true);
    setError("");

    try {
      const response = await analyzeSymptoms({
        symptomsText: form.symptomsText
      });
      const result = response.data.data;
      setSymptomAnalysis(result);
      setSuggestedSpecialties(result.suggestedSpecialties || []);

      if (!form.specialization && result.primarySpecialty?.name) {
        updateForm("specialization", result.primarySpecialty.name);
      }
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحليل الأعراض."));
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleLoadRecommendations = async () => {
    setRecommendationLoading(true);
    setError("");

    try {
      const response = await getRecommendedDoctors(buildRecommendationParams(form, patientProfile));
      const result = response.data.data;
      setRecommendations(result.topDoctors || []);
      setSuggestedSpecialties(result.suggestedSpecialties || []);

      if (!selectedDoctorId && result.topDoctors?.[0]?.id) {
        setSelectedDoctorId(result.topDoctors[0].id);
        updateForm("doctorId", result.topDoctors[0].id);
      }
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل الأطباء المقترحين."));
    } finally {
      setRecommendationLoading(false);
    }
  };

  const handleSubmitRequest = async (options = {}) => {
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = buildConsultationPayload(form, patientProfile, {
        doctorId: options.autoAssignDoctor ? undefined : options.doctorId || form.doctorId || selectedDoctorId,
        autoAssignDoctor: options.autoAssignDoctor
      });
      const response = await requestConsultation(payload);
      const result = response.data.data;

      setSuccessMessage(
        options.autoAssignDoctor
          ? `تم إرسال الطلب تلقائيًا إلى ${result.matchedDoctor?.user?.fullName || "الطبيب الأنسب"}.`
          : "تم إرسال طلب الاستشارة إلى الطبيب المختار."
      );

      resetPatientFlow();
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر إرسال طلب الاستشارة."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickMatch = async () => {
    setQuickMatchLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await quickMatchConsultation(buildConsultationPayload(form, patientProfile));
      const result = response.data.data;
      setSuccessMessage(
        `تم تنفيذ أسرع استشارة وإرسال الطلب إلى ${result.matchedDoctor?.user?.fullName || "الطبيب المتاح"}.`
      );
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تنفيذ أسرع استشارة الآن."));
    } finally {
      setQuickMatchLoading(false);
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
        badge={isPatient ? "رحلة المريض" : "صندوق الطبيب"}
        title="الاستشارات"
        subtitle={
          isPatient
            ? "اختر الطبيب يدويًا أو دع المنصة ترشح الأنسب أو اطلب أسرع استشارة متاحة الآن."
            : "راجع الاستشارات المسندة لك ورد عليها ضمن سياق منظم."
        }
      />

      {isPatient ? (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="طلب استشارة ذكي"
            subtitle="أضف وصف الحالة، ثم رشّح الأطباء الأنسب حسب التخصص والموقع والتقييم والتوفر."
            badge="Consultation Flow"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="عنوان الاستشارة"
                value={form.subject}
                onChange={(event) => updateForm("subject", event.target.value)}
                placeholder="مثال: ألم متكرر في الرأس"
                required
              />
              <Select
                label="اختيار يدوي للطبيب"
                value={form.doctorId}
                onChange={(event) => {
                  updateForm("doctorId", event.target.value);
                  setSelectedDoctorId(event.target.value);
                }}
              >
                <option value="">سيتم الاختيار من الترشيحات أو تلقائيًا</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.user.fullName} - {doctor.specialization}
                  </option>
                ))}
              </Select>
              <div className="md:col-span-2">
                <Textarea
                  label="وصف الحالة"
                  value={form.description}
                  onChange={(event) => updateForm("description", event.target.value)}
                  placeholder="اشرح الأعراض أو المشكلة الطبية بالتفصيل"
                  required
                />
              </div>
            </div>

            <SymptomAnalyzerPanel
              symptomsText={form.symptomsText}
              onSymptomsTextChange={(value) => updateForm("symptomsText", value)}
              onAnalyze={handleAnalyzeSymptoms}
              loading={analyzeLoading}
              analysis={symptomAnalysis}
              onUseSpecialty={(specialty) => updateForm("specialization", specialty)}
            />

            <DoctorFiltersPanel filters={form} onChange={updateForm} filterOptions={filterOptions} />

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={handleLoadRecommendations} disabled={recommendationLoading}>
                {recommendationLoading ? <LoaderCircle className="size-4 animate-spin" /> : <BrainCircuit className="size-4" />}
                عرض أفضل 3 أطباء
              </Button>
              <Button type="button" onClick={() => handleSubmitRequest({ autoAssignDoctor: true })} disabled={submitting}>
                {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                دع المنصة تختار الطبيب المناسب
              </Button>
              <Button type="button" variant="ghost" onClick={handleQuickMatch} disabled={quickMatchLoading}>
                {quickMatchLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                أسرع استشارة الآن
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title="ملخص الترشيح"
            subtitle="يتم استخدام التخصص والموقع والتقييم وعدد الاستشارات والتوفر الحالي في ترتيب النتائج."
            badge="Recommendation"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryTile label="مدينة المريض" value={patientProfile?.city || "غير محددة"} />
              <SummaryTile label="منطقة المريض" value={patientProfile?.region || "غير محددة"} />
              <SummaryTile
                label="التخصص المحدد"
                value={form.specialization || suggestedSpecialties[0]?.name || "غير محدد"}
              />
              <SummaryTile
                label="نوع الاستشارة"
                value={
                  form.consultationMode === "online"
                    ? "أونلاين"
                    : form.consultationMode === "in_person"
                      ? "حضوري"
                      : "مرن"
                }
              />
            </div>

            {suggestedSpecialties.length ? (
              <div className="rounded-[24px] border border-border/60 bg-secondary/25 p-4">
                <p className="text-sm font-semibold">التخصصات المقترحة من تحليل الأعراض</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedSpecialties.map((item) => (
                    <Badge key={item.name} variant="default">
                      {item.name} - {item.confidence}%
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="لا توجد اقتراحات أعراض بعد"
                description="يمكنك إدخال الأعراض ثم تحليلها للحصول على تخصصات مقترحة قبل إرسال الطلب."
              />
            )}
          </SectionCard>
        </div>
      ) : null}

      <FormError message={error} />
      {successMessage ? (
        <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {successMessage}
        </p>
      ) : null}

      {isPatient ? (
        <SectionCard
          title="أفضل 3 أطباء مقترحين"
          subtitle="يمكنك اختيار طبيب من الترشيحات أو إرسال الطلب تلقائيًا إلى الأعلى ترتيبًا."
          badge="Top 3"
          action={
            <Button
              type="button"
              variant="primary"
              disabled={submitting || !(form.doctorId || selectedDoctorId)}
              onClick={() => handleSubmitRequest({ doctorId: form.doctorId || selectedDoctorId })}
            >
              إرسال إلى الطبيب المختار
            </Button>
          }
        >
          {recommendationLoading ? (
            <RecommendationSkeleton />
          ) : recommendations.length ? (
            <div className="grid gap-4">
              {recommendations.map((doctor) => (
                <DoctorRecommendationCard
                  key={doctor.id}
                  doctor={doctor}
                  selected={(form.doctorId || selectedDoctorId) === doctor.id}
                  onSelect={() => {
                    setSelectedDoctorId(doctor.id);
                    updateForm("doctorId", doctor.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="لم يتم تحميل الترشيحات بعد"
              description="اضغط على عرض أفضل 3 أطباء لتوليد ترشيحات مبنية على التخصص والموقع والتقييم والتوفر."
            />
          )}
        </SectionCard>
      ) : null}

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
                          onChange={(event) =>
                            setResponseDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...(prev[item.id] || {}), doctorResponse: event.target.value }
                            }))
                          }
                        />
                        <Select
                          label="حالة الرد"
                          value={responseDrafts[item.id]?.status || "accepted"}
                          onChange={(event) =>
                            setResponseDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...(prev[item.id] || {}), status: event.target.value }
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
          لا توجد استشارات حاليًا.
        </div>
      ) : null}
    </div>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-[22px] border border-border/60 bg-card/35 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-medium">{value}</p>
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-[28px] border border-border/60 p-5">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-4 h-4 w-56" />
          <Skeleton className="mt-5 h-24 w-full" />
        </div>
      ))}
    </div>
  );
}
