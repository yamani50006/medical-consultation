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
    <div className="overflow-hidden rounded-[30px] border border-white/40 bg-white/80 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.38)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-secondary/65 text-muted-foreground">
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
                <th key={label} className="px-4 py-4 text-right font-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map((doctor) => {
              const busy = actionLoadingId === doctor.id;
              const isSuspended = doctor.accountStatus === "SUSPENDED";

              return (
                <tr key={doctor.id} data-admin-animate="row" className="transition-colors duration-300 hover:bg-secondary/30">
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{doctor.fullName}</p>
                      <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                      <p className="text-xs text-muted-foreground">{doctor.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col gap-2">
                      <Badge variant={getStatusBadgeVariant(doctor.accountStatus)}>
                        {formatDoctorAccountStatus(doctor.accountStatus)}
                      </Badge>
                      {doctor.isVerified ? <Badge variant="success">موثق</Badge> : <Badge variant="secondary">غير موثق</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-muted-foreground">{buildDoctorLocation(doctor)}</td>
                  <td className="px-4 py-4 align-top font-semibold">{formatMetric(doctor.totalConsultations)}</td>
                  <td className="px-4 py-4 align-top">{formatMetric(doctor.consultationsToday)}</td>
                  <td className="px-4 py-4 align-top">{formatMetric(doctor.consultationsThisWeek)}</td>
                  <td className="px-4 py-4 align-top">{formatMetric(doctor.uniquePatients)}</td>
                  <td className="px-4 py-4 align-top">{doctor.averageRating.toFixed(1)}</td>
                  <td className="px-4 py-4 align-top text-xs text-muted-foreground">{formatLastActivity(doctor.lastActivityAt)}</td>
                  <td className="px-4 py-4 align-top text-muted-foreground">{formatDate(doctor.joinedAt)}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
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
