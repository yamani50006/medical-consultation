import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/shared/PageHeader";
import SectionCard from "../components/shared/SectionCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import { createGroup } from "../features/groups/groups.api";
import { getErrorMessage } from "../utils/error";

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    visibility: "public"
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await createGroup(form);
      navigate(`/doctor/groups/${response.data.data.id}/manage`);
    } catch (err) {
      setError(getErrorMessage(err, "تعذر إنشاء المجموعة."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="إعداد الطبيب"
        title="إنشاء مجموعة تعليمية"
        subtitle="أنشئ مساحة تعليمية مركزة للمرضى حول موضوع أو حالة أو تخصص معين."
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <SectionCard
        title="إعدادات المجموعة"
        subtitle="سيستخدم المرضى هذه التفاصيل لتحديد ما إذا كانت المجموعة مناسبة لاحتياجاتهم."
        action={
          <Button asChild variant="ghost">
            <Link to="/groups">العودة إلى المجموعات</Link>
          </Button>
        }
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="اسم المجموعة"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <Input
              label="التصنيف"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              required
            />
          </div>
          <Select
            label="مستوى الظهور"
            value={form.visibility}
            onChange={(event) => setForm((current) => ({ ...current, visibility: event.target.value }))}
          >
            <option value="public">عامة</option>
            <option value="private">خاصة</option>
          </Select>
          <Textarea
            label="الوصف"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            required
          />
          <div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "جارٍ الإنشاء..." : "إنشاء مجموعة"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
