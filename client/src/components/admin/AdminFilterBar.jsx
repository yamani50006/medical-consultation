import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { Card, CardContent } from "../ui/Card";

export default function AdminFilterBar({ filters, onChange, onReset, specializationOptions = [], cityOptions = [] }) {
  return (
    <Card className="border-white/40 bg-white/75">
      <CardContent className="grid gap-4 p-5 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))_auto]">
        <Input
          value={filters.search}
          onChange={(event) => onChange("search", event.target.value)}
          placeholder="ابحث بالاسم أو البريد أو التخصص"
        />
        <Select value={filters.status} onChange={(event) => onChange("status", event.target.value)}>
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="suspended">موقوف</option>
          <option value="pending">قيد الانتظار</option>
          <option value="rejected">مرفوض</option>
        </Select>
        <Select value={filters.specialization} onChange={(event) => onChange("specialization", event.target.value)}>
          <option value="">كل التخصصات</option>
          {specializationOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={filters.city} onChange={(event) => onChange("city", event.target.value)}>
          <option value="">كل المدن</option>
          {cityOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={filters.sortBy} onChange={(event) => onChange("sortBy", event.target.value)}>
          <option value="joinedAt">الأحدث انضمامًا</option>
          <option value="lastActiveAt">آخر نشاط</option>
          <option value="rating">التقييم</option>
          <option value="consultations">إجمالي الاستشارات</option>
          <option value="consultationsToday">استشارات اليوم</option>
          <option value="consultationsWeek">استشارات الأسبوع</option>
        </Select>
        <Button type="button" variant="secondary" onClick={onReset} className="min-w-28">
          إعادة الضبط
        </Button>
      </CardContent>
    </Card>
  );
}
