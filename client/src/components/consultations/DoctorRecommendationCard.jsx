import {
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  MapPin,
  Star,
  Stethoscope,
  Video
} from "lucide-react";
import ProfileAvatar from "../shared/ProfileAvatar";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { formatConsultationFee, formatDoctorConsultationModes, formatDoctorLocation } from "../../utils/doctor";

export default function DoctorRecommendationCard({ doctor, selected, onSelect }) {
  return (
    <div
      className={`rounded-[28px] border p-5 transition-all duration-300 ${
        selected
          ? "border-primary/30 bg-primary/5 shadow-card"
          : "border-border/60 bg-card/45 hover:-translate-y-1 hover:border-primary/20"
      }`}
    >
      <div className="flex items-start gap-4">
        <ProfileAvatar
          src={doctor.user?.profileImageUrl}
          name={doctor.user?.fullName}
          className="size-16 border border-border/60"
          fallbackClassName="text-lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-semibold">{doctor.user?.fullName}</h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Stethoscope className="size-4" />
                {doctor.specialization}
              </p>
            </div>
            <Badge variant={doctor.isAvailableNow ? "success" : "secondary"}>
              {doctor.isAvailableNow ? "متاح الآن" : "يحتاج تنسيق"}
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoRow icon={MapPin} label={formatDoctorLocation(doctor)} />
            <InfoRow
              icon={Star}
              label={`${doctor.ratingSummary?.averageRating || 0} / 5 (${doctor.ratingSummary?.totalReviews || 0} تقييم)`}
            />
            <InfoRow icon={Clock3} label={`${doctor.consultationCount || 0} استشارة`} />
            <InfoRow icon={BadgeDollarSign} label={formatConsultationFee(doctor.consultationFee)} />
            <InfoRow icon={Video} label={formatDoctorConsultationModes(doctor).join(" - ")} />
            <InfoRow icon={CheckCircle2} label={`نسبة الترشيح ${doctor.recommendation?.totalScore || 0}%`} />
          </div>

          {doctor.recommendation?.reasons?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {doctor.recommendation.reasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {reason}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-5">
            <Button type="button" variant={selected ? "primary" : "secondary"} onClick={onSelect}>
              {selected ? "تم اختيار الطبيب" : "اختيار هذا الطبيب"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="size-4 text-primary" />
      <span>{label}</span>
    </div>
  );
}
