import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import Textarea from "../components/ui/Textarea";
import { addFollowUpDoctorNote, listDoctorFollowUps } from "../features/followUps/followUps.api";
import { formatDateTime } from "../utils/date";
import { getErrorMessage } from "../utils/error";

export default function DoctorFollowUpsPage() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState({});

  const loadFollowUps = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await listDoctorFollowUps({ page: 1, limit: 50 });
      setFollowUps(response.data.data);
      setDrafts(
        response.data.data.reduce((accumulator, item) => {
          accumulator[item.id] = item.doctorNote || "";
          return accumulator;
        }, {})
      );
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل المتابعات."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowUps();
  }, []);

  const handleSaveNote = async (followUpId) => {
    setSavingId(followUpId);
    setError("");

    try {
      await addFollowUpDoctorNote(followUpId, { doctorNote: drafts[followUpId] });
      await loadFollowUps();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر حفظ الملاحظة المهنية."));
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="متابعات الطبيب"
        title="إدارة متابعات المرضى"
        subtitle="راجع تحديثات تقدم المرضى، وأضف ملاحظات مهنية إلى سجل الرعاية."
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <SectionCard title="أحدث الإرسالات" subtitle="أحدث تحديثات المتابعة الواردة من المرضى ضمن خططك العلاجية.">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[24px] border border-border/60 p-5">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="mt-4 h-20 w-full" />
              </div>
            ))}
          </div>
        ) : followUps.length ? (
          <div className="space-y-4">
            {followUps.map((item) => (
              <div key={item.id} className="rounded-[26px] border border-border/60 bg-secondary/30 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-semibold">{item.patient?.user?.fullName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.treatmentPlan?.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    الألم {item.painLevel ?? "-"}/10
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
                  <div className="space-y-3">
                    <div className="rounded-[20px] border border-border/60 bg-card/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        حالة الأعراض
                      </p>
                      <p className="mt-3 text-sm leading-7">{item.symptomsStatus}</p>
                    </div>
                    <div className="rounded-[20px] border border-border/60 bg-card/50 p-4 text-sm text-muted-foreground">
                      الآثار الجانبية: {item.sideEffects || "لا يوجد"}
                      <br />
                      ملاحظات المريض: {item.notes || "لا توجد ملاحظات إضافية"}
                    </div>
                    <Button asChild variant="ghost">
                      <Link to={`/doctor/treatment-plans/${item.treatmentPlan.id}`}>فتح الخطة العلاجية</Link>
                    </Button>
                  </div>

                  <div className="rounded-[20px] border border-border/60 bg-card/50 p-4">
                    <Textarea
                      label="ملاحظة مهنية"
                      value={drafts[item.id] || ""}
                      onChange={(event) =>
                        setDrafts((current) => ({ ...current, [item.id]: event.target.value }))
                      }
                    />
                    <Button
                      type="button"
                      className="mt-4"
                      disabled={savingId === item.id || !drafts[item.id]}
                      onClick={() => handleSaveNote(item.id)}
                    >
                      {savingId === item.id ? "جارٍ الحفظ..." : "حفظ الملاحظة"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="لا توجد متابعات للمرضى حتى الآن"
            description="ستظهر هنا تحديثات المرضى بمجرد إرسال متابعاتهم للخطط العلاجية النشطة."
          />
        )}
      </SectionCard>
    </div>
  );
}
