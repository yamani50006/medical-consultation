import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormError from "../components/forms/FormError";
import FadeInSection from "../components/shared/FadeInSection";
import PageHeader from "../components/shared/PageHeader";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../utils/error";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "فشل تسجيل الدخول."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeInSection className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[34px] bg-slate-950 text-white dark:bg-slate-900">
          <CardContent className="flex h-full flex-col justify-between p-8">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
                دخول آمن
              </span>
              <h1 className="font-display text-4xl font-semibold tracking-tight">
                مرحبًا بعودتك إلى مساحة الاستشارات.
              </h1>
              <p className="max-w-md text-sm leading-7 text-slate-300">
                سجّل الدخول للمتابعة إلى اللوحات الخاصة بكل دور وإدارة الاستشارات والمواعيد.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "انتقالات صفحات سلسة ووصول سريع إلى لوحة التحكم.",
                "جلسة محمية عبر JWT مع تنقل واضح حسب نوع الحساب.",
                "واجهة تدعم الوضع الداكن مع تفاعلات احترافية."
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
            <PageHeader title="تسجيل الدخول" subtitle="الوصول إلى حسابك في منصة الاستشارات الطبية" />
            <form className="grid gap-5" onSubmit={handleSubmit}>
              <Input
                label="البريد الإلكتروني"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Input
                label="كلمة المرور"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <FormError message={error} />
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? "جارٍ تسجيل الدخول..." : "دخول"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </FadeInSection>
  );
}
