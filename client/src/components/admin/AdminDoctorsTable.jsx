import { Eye, ShieldAlert, ShieldCheck, Trash2, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { buildDoctorLocation, formatDoctorAccountStatus, formatLastActivity, formatMetric } from "../../utils/admin";
import { formatDate } from "../../utils/date";
import { getStatusBadgeVariant } from "../../utils/status";

export default function AdminDoctorsTable({ items, actionLoadingId, onSuspend, onReactivate, onVerify, onDelete, onWarn }) {
  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-border/70 bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
        لا توجد سجلات أطباء مطابقة للفلاتر الحالية.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.93),rgba(240,249,250,0.9))] shadow-[0_30px_100px_-56px_rgba(15,23,42,0.3)]">
      <div className="flex items-center justify-between gap-4 border-b border-white/70 bg-[linear-gradient(90deg,rgba(13,148,136,0.12),rgba(6,182,212,0.08),rgba(255,255,255,0.2))] px-5 py-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">سجل الكادر الطبي</h2>
          <p className="mt-1 text-xs text-slate-500">عرض تشغيلي منظم يوازن بين القرار السريع ووضوح البيانات.</p>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-xs font-semibold text-primary shadow-sm">
          {formatMetric(items.length)} طبيبًا في هذه الصفحة
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full text-sm">
          <thead className="bg-[rgba(236,245,246,0.88)] text-slate-600">
            <tr>
              {[
                "الطبيب",
                "الحالة",
                "الموقع",
                "الإجمالي",
                "اليوم",
                "الأسبوع",
                "المرضى",
                "التقييم",
                "آخر نشاط",
                "الانضمام",
                "إجراءات"
              ].map((label) => (
                <th key={label} className="px-4 py-4 text-right text-xs font-bold tracking-wide">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(148,163,184,0.14)] bg-white/55">
            {items.map((doctor) => {
              const busy = actionLoadingId === doctor.id;
              const isSuspended = doctor.accountStatus === "SUSPENDED";

              return (
                <tr
                  key={doctor.id}
                  data-admin-animate="row"
                  className="group transition-colors duration-300 hover:bg-[rgba(240,249,250,0.72)]"
                >
                  <td className="px-4 py-5 align-top">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-11 w-1 rounded-full bg-gradient-to-b from-teal-500 via-cyan-400 to-transparent opacity-80" />
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{doctor.fullName}</p>
                        <p className="text-xs font-medium text-primary/90">{doctor.specialization}</p>
                        <p className="text-xs text-slate-500">{doctor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 align-top">
                    <div className="flex flex-col gap-2">
                      <Badge variant={getStatusBadgeVariant(doctor.accountStatus)}>
                        {formatDoctorAccountStatus(doctor.accountStatus)}
                      </Badge>
                      {doctor.isVerified ? <Badge variant="success">موثق</Badge> : <Badge variant="secondary">غير موثق</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-5 align-top text-slate-600">{buildDoctorLocation(doctor)}</td>
                  <td className="px-4 py-5 align-top">
                    <MetricPill value={doctor.totalConsultations} label="كلّي" />
                  </td>
                  <td className="px-4 py-5 align-top">
                    <MetricPill value={doctor.consultationsToday} label="اليوم" accent="teal" />
                  </td>
                  <td className="px-4 py-5 align-top">
                    <MetricPill value={doctor.consultationsThisWeek} label="الأسبوع" accent="cyan" />
                  </td>
                  <td className="px-4 py-5 align-top">
                    <MetricPill value={doctor.uniquePatients} label="فريد" accent="slate" />
                  </td>
                  <td className="px-4 py-5 align-top">
                    <div className="inline-flex min-w-20 flex-col rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-center">
                      <span className="font-display text-lg font-bold text-amber-700">{doctor.averageRating.toFixed(1)}</span>
                      <span className="text-[11px] text-amber-700/75">من 5</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 align-top text-xs leading-6 text-slate-500">{formatLastActivity(doctor.lastActivityAt)}</td>
                  <td className="px-4 py-5 align-top text-slate-500">{formatDate(doctor.joinedAt)}</td>
                  <td className="px-4 py-5 align-top">
                    <div className="flex max-w-[18rem] flex-wrap gap-2">
                      <Button asChild size="sm" variant="secondary">
                        <Link to={`/admin/doctors/${doctor.id}`}>
                          <Eye className="size-4" />
                          التفاصيل
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onWarn(doctor)} disabled={busy}>
                        <TriangleAlert className="size-4" />
                        تنبيه
                      </Button>
                      {!doctor.isVerified ? (
                        <Button size="sm" variant="secondary" onClick={() => onVerify(doctor.id)} disabled={busy}>
                          <ShieldCheck className="size-4" />
                          توثيق
                        </Button>
                      ) : null}
                      {isSuspended ? (
                        <Button size="sm" variant="secondary" onClick={() => onReactivate(doctor)} disabled={busy}>
                          <ShieldCheck className="size-4" />
                          إعادة التفعيل
                        </Button>
                      ) : (
                        <Button size="sm" variant="danger" onClick={() => onSuspend(doctor)} disabled={busy}>
                          <ShieldAlert className="size-4" />
                          إيقاف
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => onDelete(doctor)} disabled={busy}>
                        <Trash2 className="size-4" />
                        حذف منطقي
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricPill({ value, label, accent = "default" }) {
  const accentClassName =
    accent === "teal"
      ? "border-teal-200/80 bg-teal-50/90 text-teal-700"
      : accent === "cyan"
        ? "border-cyan-200/80 bg-cyan-50/90 text-cyan-700"
        : accent === "slate"
          ? "border-slate-200/80 bg-slate-50/90 text-slate-700"
          : "border-white/70 bg-white/80 text-slate-800";

  return (
    <div className={`inline-flex min-w-20 flex-col rounded-2xl border px-3 py-2 text-center shadow-sm ${accentClassName}`}>
      <span className="font-display text-lg font-bold">{formatMetric(value)}</span>
      <span className="text-[11px] opacity-75">{label}</span>
    </div>
  );
}
