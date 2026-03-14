import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Skeleton from "../components/ui/Skeleton";
import Textarea from "../components/ui/Textarea";
import {
  createReview,
  listDoctorReviews,
  listEligibleReviewTargets,
  listMyReviews
} from "../features/reviews/reviews.api";
import useAuth from "../hooks/useAuth";
import { formatDateTime } from "../utils/date";
import { getErrorMessage } from "../utils/error";

function formatReviewSourceType(sourceType) {
  const translations = {
    consultation: "استشارة",
    appointment: "موعد"
  };

  return translations[sourceType] || sourceType;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const isPatient = user?.role === "PATIENT";
  const [eligibleTargets, setEligibleTargets] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingKey, setSubmittingKey] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      if (isPatient) {
        const [eligibleResponse, reviewsResponse] = await Promise.all([
          listEligibleReviewTargets(),
          listMyReviews({ page: 1, limit: 50 })
        ]);

        setEligibleTargets(eligibleResponse.data.data);
        setReviews(reviewsResponse.data.data);
      } else {
        const response = await listDoctorReviews({ page: 1, limit: 50 });
        setReviews(response.data.data);
        setSummary(response.data.meta?.summary || { averageRating: 0, totalReviews: 0 });
      }
    } catch (err) {
      setError(getErrorMessage(err, "تعذر تحميل التقييمات."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isPatient]);

  const handleCreateReview = async (target) => {
    const key = `${target.sourceType}:${target.id}`;
    const draft = drafts[key] || { rating: "", comment: "" };
    setSubmittingKey(key);
    setError("");

    try {
      await createReview({
        rating: Number(draft.rating),
        comment: draft.comment,
        ...(target.sourceType === "consultation"
          ? { consultationId: target.id }
          : { appointmentId: target.id })
      });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "تعذر إرسال التقييم."));
    } finally {
      setSubmittingKey("");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge={isPatient ? "تقييمات المريض" : "تقييمات الطبيب"}
        title="التقييمات والمراجعات"
        subtitle={
          isPatient
            ? "يمكنك تقييم الاستشارات أو المواعيد بعد اكتمالها فقط."
            : "راجع ملاحظات المرضى وتابع مستوى تقييمك الحالي."
        }
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {isPatient ? (
        <PatientReviews
          eligibleTargets={eligibleTargets}
          reviews={reviews}
          loading={loading}
          drafts={drafts}
          setDrafts={setDrafts}
          onSubmit={handleCreateReview}
          submittingKey={submittingKey}
        />
      ) : (
        <DoctorReviews reviews={reviews} loading={loading} summary={summary} />
      )}
    </div>
  );
}

function PatientReviews({ eligibleTargets, reviews, loading, drafts, setDrafts, onSubmit, submittingKey }) {
  return (
    <>
      <SectionCard
        title="التفاعلات المكتملة المتاحة للتقييم"
        subtitle="يمكنك تقييم الاستشارات أو المواعيد التي اكتملت فقط."
      >
        {loading ? (
          <ReviewSkeleton />
        ) : eligibleTargets.length ? (
          eligibleTargets.map((target) => {
            const key = `${target.sourceType}:${target.id}`;
            const draft = drafts[key] || { rating: "", comment: "" };

            return (
              <div key={key} className="rounded-[24px] border border-border/60 bg-secondary/35 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold">{target.doctorName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{target.doctorSpecialization}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatReviewSourceType(target.sourceType)} • {formatDateTime(target.occurredAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {formatReviewSourceType(target.sourceType)}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[160px_1fr]">
                  <Input
                    label="التقييم (1 - 5)"
                    type="number"
                    min="1"
                    max="5"
                    value={draft.rating}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [key]: { ...draft, rating: event.target.value }
                      }))
                    }
                  />
                  <Textarea
                    label="التعليق"
                    value={draft.comment}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [key]: { ...draft, comment: event.target.value }
                      }))
                    }
                  />
                </div>

                <Button
                  type="button"
                  className="mt-4"
                  disabled={submittingKey === key || !draft.rating}
                  onClick={() => onSubmit(target)}
                >
                  {submittingKey === key ? "جارٍ الإرسال..." : "إرسال التقييم"}
                </Button>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="لا توجد تفاعلات مكتملة بانتظار التقييم"
            description="عند اكتمال الاستشارة أو الموعد سيظهر هنا كعنصر متاح للتقييم."
          />
        )}
      </SectionCard>

      <SectionCard title="تقييماتك المرسلة" subtitle="جميع التقييمات التي أرسلتها سابقاً.">
        {loading ? (
          <ReviewSkeleton />
        ) : reviews.length ? (
          reviews.map((item) => (
            <ReviewCard
              key={item.id}
              title={item.doctor?.user?.fullName}
              subtitle={item.doctor?.specialization}
              rating={item.rating}
              comment={item.comment}
              createdAt={item.createdAt}
            />
          ))
        ) : (
          <EmptyState title="لم تُرسل أي تقييمات بعد" description="سيظهر سجل تقييماتك هنا." />
        )}
      </SectionCard>
    </>
  );
}

function DoctorReviews({ reviews, loading, summary }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="متوسط التقييم" subtitle="المتوسط الحالي لجميع التقييمات المرسلة.">
          <div className="flex items-end gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-amber-600">
              <Star className="size-5 fill-current" />
              <span className="font-display text-3xl font-semibold">{summary.averageRating || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">{summary.totalReviews || 0} تقييم</p>
          </div>
        </SectionCard>

        <SectionCard title="جودة الانطباع" subtitle="تساعدك ملاحظات المرضى الحديثة على قياس جودة الرعاية والتواصل.">
          <p className="text-sm leading-7 text-muted-foreground">
            راجع التعليقات لاكتشاف نقاط القوة المتكررة، والفجوات في وضوح التواصل، وفرص التحسين بعد اكتمال الرعاية.
          </p>
        </SectionCard>
      </div>

      <SectionCard title="أحدث تقييمات المرضى" subtitle="أحدث التقييمات والتعليقات المكتوبة من المرضى.">
        {loading ? (
          <ReviewSkeleton />
        ) : reviews.length ? (
          reviews.map((item) => (
            <ReviewCard
              key={item.id}
              title={item.patient?.user?.fullName}
              subtitle={item.consultation?.subject || "موعد مكتمل"}
              rating={item.rating}
              comment={item.comment}
              createdAt={item.createdAt}
            />
          ))
        ) : (
          <EmptyState
            title="لا توجد تقييمات حتى الآن"
            description="ستظهر تقييمات المرضى هنا بعد اكتمال التفاعل العلاجي وإرسال المراجعة."
          />
        )}
      </SectionCard>
    </>
  );
}

function ReviewCard({ title, subtitle, rating, comment, createdAt }) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-secondary/35 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600">
          <Star className="size-4 fill-current" />
          {rating}/5
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-foreground">{comment || "لم يتم إضافة تعليق مكتوب."}</p>
      <p className="mt-3 text-xs text-muted-foreground">{formatDateTime(createdAt)}</p>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-[24px] border border-border/60 p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-4 h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
