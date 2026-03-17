import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { Card, CardContent } from "../ui/Card";

export default function AdminFilterBar({ filters, onChange, onReset, specializationOptions = [], cityOptions = [] }) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/70 shadow-[0_26px_80px_-52px_rgba(15,23,42,0.22)]">
      <CardContent className="relative p-0">
        <div className="flex items-center justify-between gap-4 border-b border-border/60 bg-[linear-gradient(90deg,rgba(13,148,136,0.08),rgba(6,182,212,0.06),hsla(var(--card),0.32))] px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">تصفية وتشغيل الجدول</p>
            <p className="mt-1 text-xs text-slate-500">فلترة سريعة مع ترتيب بصري متناسق مع هوية المنصة.</p>
          </div>
          <Button type="button" variant="secondary" onClick={onReset} className="min-w-28 bg-card/70">
            إعادة الضبط
          </Button>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
          <Input
            label="بحث سريع"
            value={filters.search}
            onChange={(event) => onChange("search", event.target.value)}
            placeholder="الاسم، البريد، التخصص"
            className="bg-card/65"
          />
          <Select label="الحالة" value={filters.status} onChange={(event) => onChange("status", event.target.value)} className="bg-card/65">
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="suspended">موقوف</option>
            <option value="pending">قيد الانتظار</option>
            <option value="rejected">مرفوض</option>
          </Select>
          <Select
            label="التخصص"
            value={filters.specialization}
            onChange={(event) => onChange("specialization", event.target.value)}
            className="bg-card/65"
          >
            <option value="">كل التخصصات</option>
            {specializationOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select label="المدينة" value={filters.city} onChange={(event) => onChange("city", event.target.value)} className="bg-card/65">
            <option value="">كل المدن</option>
            {cityOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select label="الترتيب" value={filters.sortBy} onChange={(event) => onChange("sortBy", event.target.value)} className="bg-card/65">
            <option value="joinedAt">الأحدث انضمامًا</option>
            <option value="lastActiveAt">آخر نشاط</option>
            <option value="rating">التقييم</option>
            <option value="consultations">إجمالي الاستشارات</option>
            <option value="consultationsToday">استشارات اليوم</option>
            <option value="consultationsWeek">استشارات الأسبوع</option>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
