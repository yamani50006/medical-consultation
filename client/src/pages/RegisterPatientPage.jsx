import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerPatient } from "../features/auth/auth.api";
import { getErrorMessage } from "../utils/error";
import FormError from "../components/forms/FormError";
import FadeInSection from "../components/shared/FadeInSection";
import PageHeader from "../components/shared/PageHeader";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import useAuth from "../hooks/useAuth";

export default function RegisterPatientPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    gender: "male",
    dateOfBirth: "",
    city: "",
    region: "",
    bloodType: "",
    chronicDiseases: "",
    currentMedications: ""
  });

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "fullName":
        if (!value.trim()) error = "الاسم الكامل مطلوب.";
        else if (value.trim().length < 2) error = "الاسم الكامل يجب أن يكون على الأقل حرفين.";
        break;
      case "email":
        if (!value.trim()) error = "البريد الإلكتروني مطلوب.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "البريد الإلكتروني غير صالح.";
        break;
      case "password":
        if (!value) error = "كلمة المرور مطلوبة.";
        else if (value.length < 6) error = "كلمة المرور يجب أن تكون على الأقل 6 أحرف.";
        break;
      case "dateOfBirth":
        if (!value) error = "تاريخ الميلاد مطلوب.";
        else {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 0 || age > 120) error = "تاريخ الميلاد غير صالح.";
        }
        break;
      default:
        break;
    }
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    validateField(name, value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    // Validate all required fields
    const errors = {};
    Object.keys(form).forEach((key) => {
      if (["fullName", "email", "password", "dateOfBirth"].includes(key)) {
        const error = validateField(key, form[key]);
        if (error) errors[key] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await registerPatient(form);
      await login({ email: form.email, password: form.password });
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "فشل إنشاء الحساب."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeInSection className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[34px] bg-gradient-to-br from-cyan-500/15 via-white/60 to-teal-500/10 dark:from-cyan-500/10 dark:via-slate-950/70 dark:to-teal-500/10">
          <CardContent className="space-y-6 p-8">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary">
              تسجيل المريض
            </span>
            <h1 className="font-display text-4xl font-semibold tracking-tight">أنشئ حساب مريض بتجربة تسجيل واضحة وسريعة.</h1>
            <p className="text-sm leading-7 text-muted-foreground">
              بعد التسجيل يمكن للمريض طلب الاستشارات ومتابعة المواعيد والوصول إلى المحتوى الطبي الموثوق.
            </p>
            <div className="grid gap-3">
              {[
                "ملف مريض منظم مع معلومات صحية اختيارية.",
                "تسجيل دخول فوري بعد نجاح إنشاء الحساب.",
                "تجربة متجاوبة على الجوال وسطح المكتب."
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-border/60 bg-card/70 px-4 py-3 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[34px]">
          <CardContent className="p-8">
            <PageHeader title="إنشاء حساب مريض" subtitle="أنشئ حساب المريض في خطوات بسيطة" />
            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
              <Input label="الاسم الكامل" name="fullName" value={form.fullName} onChange={handleChange} onBlur={handleBlur} error={fieldErrors.fullName} required />
              <Input label="البريد الإلكتروني" name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} error={fieldErrors.email} required />
              <Input
                label="كلمة المرور"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.password}
                required
              />
              <Select label="الجنس" name="gender" value={form.gender} onChange={handleChange}>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
                <option value="other">آخر</option>
              </Select>
              <Input
                label="تاريخ الميلاد"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldErrors.dateOfBirth}
                required
              />
              <Input label="المدينة" name="city" value={form.city} onChange={handleChange} />
              <Input label="المنطقة" name="region" value={form.region} onChange={handleChange} />
              <Input label="فصيلة الدم" name="bloodType" value={form.bloodType} onChange={handleChange} />
              <Input
                label="الأمراض المزمنة"
                name="chronicDiseases"
                value={form.chronicDiseases}
                onChange={handleChange}
              />
              <Input
                label="الأدوية الحالية"
                name="currentMedications"
                value={form.currentMedications}
                onChange={handleChange}
              />
              <div className="md:col-span-2">
                <FormError message={error} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                  {loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب مريض"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FadeInSection>
  );
}
