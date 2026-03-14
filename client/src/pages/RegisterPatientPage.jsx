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
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    gender: "male",
    dateOfBirth: "",
    bloodType: "",
    chronicDiseases: "",
    currentMedications: ""
  });

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
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
                required
              />
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
