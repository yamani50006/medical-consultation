import Input from "../ui/Input";
import Select from "../ui/Select";
import ToggleField from "../ui/ToggleField";

const sortOptions = [
  { value: "best_match", label: "أفضل تطابق" },
  { value: "top_rated", label: "الأعلى تقييمًا" },
  { value: "nearest", label: "الأقرب" },
  { value: "most_consultations", label: "الأكثر خبرة" },
  { value: "price_low_to_high", label: "الأقل سعرًا" }
];

export default function DoctorFiltersPanel({ filters, onChange, filterOptions = {} }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Select
          label="التخصص"
          value={filters.specialization}
          onChange={(event) => onChange("specialization", event.target.value)}
        >
          <option value="">كل التخصصات</option>
          {(filterOptions.specializations || []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <Select label="مدينة الطبيب" value={filters.city} onChange={(event) => onChange("city", event.target.value)}>
          <option value="">كل المدن</option>
          {(filterOptions.cities || []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <Select
          label="المنطقة"
          value={filters.region}
          onChange={(event) => onChange("region", event.target.value)}
        >
          <option value="">كل المناطق</option>
          {(filterOptions.regions || []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <Select
          label="طريقة الترتيب"
          value={filters.sortBy}
          onChange={(event) => onChange("sortBy", event.target.value)}
        >
          {sortOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>

        <Select
          label="نوع الاستشارة"
          value={filters.consultationMode}
          onChange={(event) => onChange("consultationMode", event.target.value)}
        >
          <option value="any">الكل</option>
          <option value="online">أونلاين</option>
          <option value="in_person">حضوري</option>
        </Select>

        <Input
          label="أقصى سعر"
          type="number"
          min="0"
          value={filters.maxPrice}
          onChange={(event) => onChange("maxPrice", event.target.value)}
          placeholder={filterOptions.priceRange?.max ? String(filterOptions.priceRange.max) : "بدون حد"}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ToggleField
          label="الأطباء المتاحون الآن"
          description="أظهر فقط الأطباء الجاهزين للاستشارة في الوقت الحالي"
          checked={filters.availableNow}
          onChange={(event) => onChange("availableNow", event.target.checked)}
        />
        <ToggleField
          label="الأقرب للمريض"
          description="رتب النتائج حسب قرب المدينة أو المنطقة من ملف المريض"
          checked={filters.sortBy === "nearest"}
          onChange={(event) => onChange("sortBy", event.target.checked ? "nearest" : "best_match")}
        />
      </div>
    </div>
  );
}
