import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerDoctor } from "../features/auth/auth.api";
import { getErrorMessage } from "../utils/error";
import FormError from "../components/forms/FormError";
import FadeInSection from "../components/shared/FadeInSection";
import PageHeader from "../components/shared/PageHeader";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import ToggleField from "../components/ui/ToggleField";

export default function RegisterDoctorPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    specialization: "",
    city: "",
    region: "",
    yearsOfExperience: "",
    bio: "",
    licenseNumber: "",
    consultationFee: "",
    supportsOnline: true,
    supportsInPerson: true,
    isAvailableNow: false
  });

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleToggle = (name, checked) => {
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await registerDoctor({
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience),
        consultationFee: form.consultationFee === "" ? undefined : Number(form.consultationFee)
      });
      setSuccessMessage("تم إنشاء حساب الطبيب. انتظر موافقة الإدارة قبل تسجيل الدخول.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(getErrorMessage(err, "فشل إنشاء الحساب."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeInSection className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[34px] bg-slate-950 text-white dark:bg-slate-900">
          <CardContent className="space-y-6 p-8">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
              تسجيل الطبيب
            </span>
            <h1 className="font-display text-4xl font-semibold tracking-tight">
              انضم إلى المنصة بملف طبي احترافي قابل للمراجعة والاعتماد.
            </h1>
            <p className="text-sm leading-7 text-slate-300">
              يبقى حساب الطبيب في حالة انتظار حتى تتم الموافقة عليه من الإدارة للحفاظ على موثوقية الخدمة.
            </p>
            <div className="grid gap-3">
              {[
                "يتم تسجيل التخصص والخبرة ورقم الترخيص أثناء إنشاء الحساب.",
                "يتكامل مسار الموافقة مع لوحة الإدارة وواجهات البرمجة.",
                "تُفعَّل أدوات المنشورات والاستشارات بعد الاعتماد."
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[34px]">
          <CardContent className="p-8">
            <PageHeader title="إنشاء حساب طبيب" subtitle="حسابات الأطباء تحتاج إلى موافقة الإدارة" />
            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
              <Input label="الاسم الكامل" name="fullName" value={form.fullName} onChange={handleChange} required />
              <Input label="البريد الإلكتروني" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Input
                label="كلمة المرور"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <Input
                label="التخصص"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                required
              />
              <Input
                label="سنوات الخبرة"
                name="yearsOfExperience"
                type="number"
                min="0"
                max="70"
                value={form.yearsOfExperience}
                onChange={handleChange}
                required
              />
              <Input label="المدينة" name="city" value={form.city} onChange={handleChange} />
              <Input label="المنطقة" name="region" value={form.region} onChange={handleChange} />
              <Input
                label="رقم الترخيص"
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleChange}
                required
              />
              <Input
                label="سعر الاستشارة"
                name="consultationFee"
                type="number"
                min="0"
                value={form.consultationFee}
                onChange={handleChange}
                placeholder="اختياري"
              />
              <div className="md:col-span-2">
                <Textarea label="نبذة تعريفية" name="bio" value={form.bio} onChange={handleChange} required />
              </div>
              <div className="md:col-span-2 grid gap-3 lg:grid-cols-2">
                <ToggleField
                  label="استشارات أونلاين"
                  description="تفعيل استقبال الاستشارات عبر المنصة"
                  checked={form.supportsOnline}
                  onChange={(event) => handleToggle("supportsOnline", event.target.checked)}
                />
                <ToggleField
                  label="استشارات حضورية"
                  description="تفعيل الاستشارات أو الزيارات الحضورية"
                  checked={form.supportsInPerson}
                  onChange={(event) => handleToggle("supportsInPerson", event.target.checked)}
                />
                <ToggleField
                  label="متاح الآن"
                  description="إظهار الطبيب ضمن نتائج أسرع استشارة"
                  checked={form.isAvailableNow}
                  onChange={(event) => handleToggle("isAvailableNow", event.target.checked)}
                  className="lg:col-span-2"
                />
              </div>
              <div className="md:col-span-2 space-y-4">
                <FormError message={error} />
                {successMessage ? (
                  <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">
                    {successMessage}
                  </p>
                ) : null}
                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                  {loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب طبيب"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FadeInSection>
  );
}
