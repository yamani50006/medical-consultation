import { Camera, LoaderCircle, Mail, ShieldCheck, Stethoscope, Trash2, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import FormError from "../components/forms/FormError";
import PageHeader from "../components/shared/PageHeader";
import ProfileAvatar from "../components/shared/ProfileAvatar";
import SectionCard from "../components/shared/SectionCard";
import StatusBadge from "../components/shared/StatusBadge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Skeleton from "../components/ui/Skeleton";
import Textarea from "../components/ui/Textarea";
import ToggleField from "../components/ui/ToggleField";
import { getMe } from "../features/auth/auth.api";
import { getMyDoctorProfile, updateMyDoctorProfile } from "../features/doctors/doctors.api";
import { getMyPatientProfile, updateMyPatientProfile } from "../features/patients/patients.api";
import { updateCurrentUser } from "../features/users/users.api";
import useAuth from "../hooks/useAuth";
import { formatDate } from "../utils/date";
import { getErrorMessage } from "../utils/error";
import { readProfileImageFile } from "../utils/profileImage";
import { formatRole, formatStatus } from "../utils/status";

const roleMeta = {
  ADMIN: {
    badge: "إعدادات الحساب",
    icon: ShieldCheck,
    title: "بيانات الحساب"
  },
  DOCTOR: {
    badge: "ملف الطبيب",
    icon: Stethoscope,
    title: "البيانات المهنية"
  },
  PATIENT: {
    badge: "ملف المريض",
    icon: UserRound,
    title: "البيانات الصحية الأساسية"
  }
};

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function createAccountForm(user) {
  return {
    fullName: user?.fullName || "",
    email: user?.email || "",
    profileImageUrl: user?.profileImageUrl || null
  };
}

function createPatientForm(profile) {
  return {
    gender: profile?.gender || "male",
    dateOfBirth: toDateInputValue(profile?.dateOfBirth),
    city: profile?.city || "",
    region: profile?.region || "",
    bloodType: profile?.bloodType || "",
    chronicDiseases: profile?.chronicDiseases || "",
    currentMedications: profile?.currentMedications || ""
  };
}

function createDoctorForm(profile) {
  return {
    specialization: profile?.specialization || "",
    city: profile?.city || "",
    region: profile?.region || "",
    yearsOfExperience: String(profile?.yearsOfExperience ?? ""),
    bio: profile?.bio || "",
    licenseNumber: profile?.licenseNumber || "",
    consultationFee: profile?.consultationFee ?? "",
    supportsOnline: profile?.supportsOnline ?? true,
    supportsInPerson: profile?.supportsInPerson ?? true,
    isAvailableNow: profile?.isAvailableNow ?? false
  };
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reloadSeed, setReloadSeed] = useState(0);
  const [accountForm, setAccountForm] = useState(() => createAccountForm(user));
  const [patientForm, setPatientForm] = useState(() => createPatientForm(null));
  const [doctorForm, setDoctorForm] = useState(() => createDoctorForm(null));
  const [roleProfile, setRoleProfile] = useState(null);
  const fileInputRef = useRef(null);

  const meta = roleMeta[user?.role] || roleMeta.ADMIN;
  const RoleIcon = meta.icon;

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!user?.role) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setSuccessMessage("");

      try {
        if (user.role === "PATIENT") {
          const response = await getMyPatientProfile();
          if (cancelled) {
            return;
          }

          const profile = response.data.data;
          setRoleProfile(profile);
          setAccountForm(createAccountForm(profile.user));
          setPatientForm(createPatientForm(profile));
        } else if (user.role === "DOCTOR") {
          const response = await getMyDoctorProfile();
          if (cancelled) {
            return;
          }

          const profile = response.data.data;
          setRoleProfile(profile);
          setAccountForm(createAccountForm(profile.user));
          setDoctorForm(createDoctorForm(profile));
        } else {
          const response = await getMe();
          if (cancelled) {
            return;
          }

          setRoleProfile(null);
          setAccountForm(createAccountForm(response.data.data));
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "تعذر تحميل بيانات الملف الشخصي."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [reloadSeed, user?.role]);

  const accountHighlights = useMemo(
    () => [
      { label: "نوع الحساب", value: formatRole(user?.role) || "-" },
      { label: "الحالة", value: formatStatus(user?.status) || "-" },
      { label: "تاريخ الانضمام", value: user?.createdAt ? formatDate(user.createdAt) : "-" }
    ],
    [user?.createdAt, user?.role, user?.status]
  );

  const roleHighlights = useMemo(() => {
    if (user?.role === "PATIENT") {
      return [
        { label: "فصيلة الدم", value: patientForm.bloodType || "غير محددة" },
        { label: "تاريخ الميلاد", value: patientForm.dateOfBirth || "-" },
        { label: "الموقع", value: [patientForm.city, patientForm.region].filter(Boolean).join(" - ") || "-" }
      ];
    }

    if (user?.role === "DOCTOR") {
      return [
        { label: "رقم الترخيص", value: doctorForm.licenseNumber || "-" },
        { label: "الموقع", value: [doctorForm.city, doctorForm.region].filter(Boolean).join(" - ") || "-" },
        {
          label: "حالة الاعتماد",
          value: roleProfile?.approvalStatus ? formatStatus(roleProfile.approvalStatus) : "-"
        }
      ];
    }

    return [];
  }, [doctorForm.city, doctorForm.licenseNumber, doctorForm.region, patientForm.bloodType, patientForm.city, patientForm.dateOfBirth, patientForm.region, roleProfile?.approvalStatus, user?.role]);

  const handleAccountChange = (event) => {
    const { name, value } = event.target;
    setAccountForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handlePatientChange = (event) => {
    const { name, value } = event.target;
    setPatientForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleDoctorChange = (event) => {
    const { name, value } = event.target;
    setDoctorForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleDoctorToggle = (name, checked) => {
    setDoctorForm((current) => ({
      ...current,
      [name]: checked
    }));
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const profileImageUrl = await readProfileImageFile(file);
      setAccountForm((current) => ({
        ...current,
        profileImageUrl
      }));
    } catch (err) {
      setError(err.message || "تعذر تجهيز صورة البروفايل.");
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setAccountForm((current) => ({
      ...current,
      profileImageUrl: null
    }));
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await updateCurrentUser({
        fullName: accountForm.fullName.trim(),
        email: accountForm.email.trim(),
        profileImageUrl: accountForm.profileImageUrl
      });

      if (user?.role === "PATIENT") {
        const response = await updateMyPatientProfile({
          gender: patientForm.gender,
          dateOfBirth: patientForm.dateOfBirth,
          city: patientForm.city.trim() || null,
          region: patientForm.region.trim() || null,
          bloodType: patientForm.bloodType.trim(),
          chronicDiseases: patientForm.chronicDiseases.trim(),
          currentMedications: patientForm.currentMedications.trim()
        });
        setRoleProfile(response.data.data);
      }

      if (user?.role === "DOCTOR") {
        const response = await updateMyDoctorProfile({
          specialization: doctorForm.specialization.trim(),
          city: doctorForm.city.trim() || null,
          region: doctorForm.region.trim() || null,
          yearsOfExperience: Number(doctorForm.yearsOfExperience),
          bio: doctorForm.bio.trim(),
          licenseNumber: doctorForm.licenseNumber,
          consultationFee: doctorForm.consultationFee === "" ? null : Number(doctorForm.consultationFee),
          supportsOnline: doctorForm.supportsOnline,
          supportsInPerson: doctorForm.supportsInPerson,
          isAvailableNow: doctorForm.isAvailableNow
        });
        setRoleProfile(response.data.data);
      }

      const freshUser = await refreshUser();
      setAccountForm(createAccountForm(freshUser));
      setSuccessMessage("تم حفظ بيانات الملف الشخصي بنجاح.");
    } catch (err) {
      setError(getErrorMessage(err, "تعذر حفظ بيانات الملف الشخصي."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge={meta.badge}
        title="الملف الشخصي"
        subtitle="يمكنك تحديث صورة الحساب والبيانات الأساسية والبيانات الخاصة بدورك من شاشة واحدة."
      />

      {loading ? <ProfilePageSkeleton /> : null}

      {!loading ? (
        <form className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <SectionCard
              title="الهوية العامة"
              subtitle="صورة البروفايل والبيانات الأساسية التي تظهر مع حسابك داخل المنصة."
              badge="الحساب"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <ProfileAvatar
                  src={accountForm.profileImageUrl}
                  name={accountForm.fullName}
                  className="size-24 border-4 border-background shadow-lg"
                  fallbackClassName="text-2xl"
                />

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="secondary" onClick={handlePickImage}>
                      <Camera className="size-4" />
                      اختيار صورة
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleRemoveImage}
                      disabled={!accountForm.profileImageUrl}
                    >
                      <Trash2 className="size-4" />
                      إزالة الصورة
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    الحد الأقصى 2 ميجابايت. الأنواع المدعومة: PNG, JPG, WEBP, GIF.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="الاسم الكامل"
                  name="fullName"
                  value={accountForm.fullName}
                  onChange={handleAccountChange}
                  placeholder="أدخل الاسم الكامل"
                  required
                />
                <Input
                  label="البريد الإلكتروني"
                  name="email"
                  type="email"
                  value={accountForm.email}
                  onChange={handleAccountChange}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {accountHighlights.map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-border/60 bg-secondary/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-3 font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="ملخص الملف"
              subtitle="معاينة سريعة للحالة الحالية للحساب."
              badge="نظرة عامة"
            >
              <div className="flex items-start gap-4 rounded-[24px] border border-border/60 bg-card/45 p-5">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <RoleIcon className="size-5" />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-display text-xl font-semibold">{accountForm.fullName || "بدون اسم"}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="size-4" />
                      {accountForm.email || "-"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={user?.status}>{formatStatus(user?.status)}</StatusBadge>
                    {roleProfile?.approvalStatus ? (
                      <StatusBadge value={roleProfile.approvalStatus}>
                        {formatStatus(roleProfile.approvalStatus)}
                      </StatusBadge>
                    ) : null}
                  </div>
                </div>
              </div>

              {roleHighlights.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {roleHighlights.map((item) => (
                    <div key={item.label} className="rounded-[22px] border border-border/60 bg-secondary/25 p-4">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="mt-2 font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </SectionCard>
          </div>

          <div className="space-y-4">
            <SectionCard title={meta.title} subtitle="عدّل الحقول الخاصة بدورك مع الالتزام بقيود النظام." badge="الملف">
              {user?.role === "PATIENT" ? (
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Select label="الجنس" name="gender" value={patientForm.gender} onChange={handlePatientChange}>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                      <option value="other">آخر</option>
                    </Select>
                    <Input
                      label="تاريخ الميلاد"
                      name="dateOfBirth"
                      type="date"
                      value={patientForm.dateOfBirth}
                      onChange={handlePatientChange}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="المدينة"
                      name="city"
                      value={patientForm.city}
                      onChange={handlePatientChange}
                      placeholder="أدخل المدينة"
                    />
                    <Input
                      label="المنطقة"
                      name="region"
                      value={patientForm.region}
                      onChange={handlePatientChange}
                      placeholder="أدخل المنطقة"
                    />
                  </div>
                  <Input
                    label="فصيلة الدم"
                    name="bloodType"
                    value={patientForm.bloodType}
                    onChange={handlePatientChange}
                    placeholder="مثل O+ أو A-"
                  />
                  <Textarea
                    label="الأمراض المزمنة"
                    name="chronicDiseases"
                    value={patientForm.chronicDiseases}
                    onChange={handlePatientChange}
                    placeholder="اذكر الأمراض المزمنة الحالية إن وجدت"
                    className="min-h-28"
                  />
                  <Textarea
                    label="الأدوية الحالية"
                    name="currentMedications"
                    value={patientForm.currentMedications}
                    onChange={handlePatientChange}
                    placeholder="اذكر الأدوية التي تستخدمها حاليًا"
                    className="min-h-28"
                  />
                </div>
              ) : null}

              {user?.role === "DOCTOR" ? (
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="التخصص"
                      name="specialization"
                      value={doctorForm.specialization}
                      onChange={handleDoctorChange}
                      placeholder="مثل طب الأطفال"
                      required
                    />
                    <Input
                      label="سنوات الخبرة"
                      name="yearsOfExperience"
                      type="number"
                      min="0"
                      max="70"
                      value={doctorForm.yearsOfExperience}
                      onChange={handleDoctorChange}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="المدينة"
                      name="city"
                      value={doctorForm.city}
                      onChange={handleDoctorChange}
                      placeholder="أدخل المدينة"
                    />
                    <Input
                      label="المنطقة"
                      name="region"
                      value={doctorForm.region}
                      onChange={handleDoctorChange}
                      placeholder="أدخل المنطقة"
                    />
                  </div>
                  <Input
                    label="سعر الاستشارة"
                    name="consultationFee"
                    type="number"
                    min="0"
                    value={doctorForm.consultationFee}
                    onChange={handleDoctorChange}
                    placeholder="اختياري"
                  />
                  <Input label="رقم الترخيص" name="licenseNumber" value={doctorForm.licenseNumber} disabled readOnly />
                  <div className="grid gap-3 lg:grid-cols-2">
                    <ToggleField
                      label="استشارات أونلاين"
                      description="إظهار إمكانية استقبال الاستشارات عن بُعد"
                      checked={doctorForm.supportsOnline}
                      onChange={(event) => handleDoctorToggle("supportsOnline", event.target.checked)}
                    />
                    <ToggleField
                      label="استشارات حضورية"
                      description="إظهار إمكانية استقبال الاستشارات الحضورية"
                      checked={doctorForm.supportsInPerson}
                      onChange={(event) => handleDoctorToggle("supportsInPerson", event.target.checked)}
                    />
                    <ToggleField
                      label="متاح الآن"
                      description="إظهار الطبيب ضمن نتائج الاستشارة السريعة"
                      checked={doctorForm.isAvailableNow}
                      onChange={(event) => handleDoctorToggle("isAvailableNow", event.target.checked)}
                      className="lg:col-span-2"
                    />
                  </div>
                  <Textarea
                    label="نبذة تعريفية"
                    name="bio"
                    value={doctorForm.bio}
                    onChange={handleDoctorChange}
                    placeholder="اكتب نبذة مختصرة عن خبرتك الطبية"
                    required
                  />
                </div>
              ) : null}

              {user?.role === "ADMIN" ? (
                <div className="rounded-[24px] border border-border/60 bg-secondary/25 p-5 text-sm leading-7 text-muted-foreground">
                  يمكن لمدير النظام من هذه الصفحة تعديل الاسم والبريد الإلكتروني وصورة الحساب فقط.
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              title="حفظ التعديلات"
              subtitle="سيتم تحديث بيانات الحساب أولًا ثم حفظ الحقول الخاصة بالدور الحالي."
              badge="الإجراءات"
            >
              <FormError message={error} />
              {successMessage ? (
                <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                  {successMessage}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  حفظ التغييرات
                </Button>
                <Button type="button" variant="ghost" disabled={saving} onClick={() => setReloadSeed((current) => current + 1)}>
                  إعادة تحميل البيانات
                </Button>
              </div>
            </SectionCard>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      {Array.from({ length: 2 }).map((_, index) => (
        <SectionCard key={index} contentClassName="space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-28 w-full rounded-[28px]" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full rounded-[24px]" />
        </SectionCard>
      ))}
    </div>
  );
}
