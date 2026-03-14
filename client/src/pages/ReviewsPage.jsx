import { useEffect, useState } from "react";
import EmptyState from "../components/shared/EmptyState";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import StarRating from "../components/shared/StarRating";
import Button from "../components/ui/Button";
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
      setError(getErrorMessage(err, "تعذر تحميل بيانات التقييمات حالياً."));
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
      setError(getErrorMessage(err, "تعذر إرسال التقييم حالياً."));
    } finally {
      setSubmittingKey("");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge={isPatient ? "تقييماتك" : "تقييمات المرضى"}
        title="التقييمات والمراجعات"
        subtitle={
          isPatient
            ? "قيّم الاستشارات أو المواعيد المكتملة عبر نجوم واضحة وتعليق اختياري مختصر."
            : "راجع انطباعات المرضى وتابع متوسط تقييمك بشكل بصري أوضح."
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
      <SectionCard title="العناصر الجاهزة للتقييم" subtitle="يمكنك تقييم الاستشارات أو المواعيد بعد اكتمالها فقط.">
        {loading ? (
          <ReviewSkeleton />
        ) : eligibleTargets.length ? (
          eligibleTargets.map((target) => {
            const key = `${target.sourceType}:${target.id}`;
            const draft = drafts[key] || { rating: "", comment: "" };

            return (
              <div
                key={key}
                className="rounded-[28px] border border-border/60 bg-gradient-to-br from-background to-secondary/40 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-semibold">{target.doctorName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{target.doctorSpecialization}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatReviewSourceType(target.sourceType)} - {formatDateTime(target.occurredAt)}
                    </p>
                  </div>
                  <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {formatReviewSourceType(target.sourceType)}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
                  <div className="rounded-[24px] border border-amber-500/15 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-4">
                    <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 dark:text-amber-300">
                      التقييم
                    </p>
                    <StarRating
                      value={Number(draft.rating) || 0}
                      onChange={(rating) =>
                        setDrafts((current) => ({
                          ...current,
                          [key]: { ...draft, rating: String(rating) }
                        }))
                      }
                      size="lg"
                      className="mt-4"
                    />
                    <p className="mt-3 text-sm font-medium text-foreground/85">
                      {draft.rating ? `اخترت ${draft.rating} من 5 نجوم` : "اختر من نجمة واحدة إلى خمس نجوم"}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                      شارك انطباعك عن جودة المتابعة ووضوح التوجيه الطبي.
                    </p>
                    {target.title ? (
                      <div className="mt-4 rounded-2xl bg-background/70 px-3 py-2 text-sm leading-7 text-foreground/80">
                        {target.title}
                      </div>
                    ) : null}
                  </div>
                  <Textarea
                    label="التعليق"
                    placeholder="اكتب ملاحظة مختصرة تفيد الطبيب والمرضى الآخرين..."
                    className="min-h-[220px]"
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
                  className="mt-4 min-w-[160px]"
                  disabled={submittingKey === key || !draft.rating}
                  onClick={() => onSubmit(target)}
                >
                  {submittingKey === key ? "جارٍ إرسال التقييم..." : "إرسال التقييم"}
                </Button>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="لا توجد عناصر مكتملة بانتظار التقييم"
            description="عند اكتمال الاستشارة أو الموعد سيظهر هنا العنصر المتاح لإرسال تقييمك."
          />
        )}
      </SectionCard>

      <SectionCard title="تقييماتك المرسلة" subtitle="سجل التقييمات التي أرسلتها سابقاً للأطباء.">
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
          <EmptyState title="لم تُرسل أي تقييمات بعد" description="سيظهر سجل تقييماتك هنا بعد إرسال أول مراجعة." />
        )}
      </SectionCard>
    </>
  );
}

function DoctorReviews({ reviews, loading, summary }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="متوسط التقييم"
          subtitle="لمحة سريعة عن متوسط التقييم العام وعدد المراجعات المرسلة."
          className="overflow-hidden border-amber-500/10 bg-gradient-to-br from-amber-500/10 via-background to-background"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full border border-amber-500/15 bg-background/80 px-4 py-2 text-amber-600 shadow-sm">
                <span className="font-display text-3xl font-semibold">{summary.averageRating || 0}</span>
                <span className="text-sm font-medium text-muted-foreground">من 5</span>
              </div>
              <StarRating value={Number(summary.averageRating) || 0} readOnly size="md" showValue />
            </div>
            <div className="rounded-[22px] border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
              <span className="block text-xs font-semibold tracking-[0.18em] text-primary">إجمالي المراجعات</span>
              <span className="mt-2 block font-display text-2xl font-semibold text-foreground">
                {summary.totalReviews || 0}
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="جودة الانطباع" subtitle="قراءة سريعة لما تعكسه المراجعات عن تجربتك العلاجية والتواصلية.">
          <p className="text-sm leading-7 text-muted-foreground">
            راجع التعليقات الحديثة لاكتشاف نقاط القوة المتكررة، ووضوح الشرح، ومدى رضا المرضى عن المتابعة بعد اكتمال
            الرعاية.
          </p>
        </SectionCard>
      </div>

      <SectionCard title="أحدث تقييمات المرضى" subtitle="آخر المراجعات المكتوبة التي أرسلها المرضى بعد اكتمال التفاعل.">
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
            description="ستظهر تقييمات المرضى هنا فور اكتمال الاستشارات أو المواعيد وإرسال المراجعات."
          />
        )}
      </SectionCard>
    </>
  );
}

function ReviewCard({ title, subtitle, rating, comment, createdAt }) {
  return (
    <div className="rounded-[26px] border border-border/60 bg-gradient-to-br from-background to-secondary/35 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg font-semibold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-full border border-amber-500/15 bg-amber-500/10 px-3 py-2">
          <StarRating value={rating} readOnly size="sm" showValue />
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-foreground">{comment || "لم تتم إضافة ملاحظة مكتوبة مع هذا التقييم."}</p>
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
