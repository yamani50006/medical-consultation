import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

import { useDoctorsQuery } from "@/features/doctors";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSearchBar } from "@/features/home/components/PatientSearchBar";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { patientPalette } from "@/features/home/components/patient-theme";
import { PatientStackParamList } from "@/navigation/types";
import { Button } from "@/shared/components/Button";
import { DoctorCard } from "@/shared/components/DoctorCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { InputField } from "@/shared/components/InputField";
import { Loader } from "@/shared/components/Loader";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { useUiStore } from "@/store/ui/ui.store";

type Props = NativeStackScreenProps<PatientStackParamList, "ConsultationRequest">;

type ConsultationFormValues = {
  subject: string;
  symptoms: string;
  preferredTime: string;
};

const consultationTypes = [
  { id: "online", label: "أونلاين" },
  { id: "follow-up", label: "متابعة" },
  { id: "urgent", label: "مستعجلة" }
] as const;

export function ConsultationRequestScreen({ navigation }: Props) {
  const [search, setSearch] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<(typeof consultationTypes)[number]["id"]>("online");
  const [submitting, setSubmitting] = useState(false);
  const query = useDoctorsQuery(search ? { search, supportsOnline: true } : { supportsOnline: true });
  const showToast = useUiStore((state) => state.showToast);
  const form = useForm<ConsultationFormValues>({
    defaultValues: {
      subject: "",
      symptoms: "",
      preferredTime: ""
    }
  });

  const doctors = query.data ?? [];
  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === selectedDoctorId) ?? null,
    [doctors, selectedDoctorId]
  );

  return (
    <PatientScreen>
      <ScreenHeader title="طلب استشارة" subtitle="اختر الطبيب ثم أكمل تفاصيل الاستشارة" />
      <PatientSurface style={{ gap: 14 }}>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 22 }}>1. اختر الطبيب المناسب</Text>
          <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right" }}>
            البحث هنا مخصص للأطباء المتاحين للاستشارة عن بُعد.
          </Text>
        </View>
        <PatientSearchBar value={search} onChangeText={setSearch} placeholder="ابحث باسم الطبيب أو التخصص..." />
        <View style={{ flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" }}>
          {consultationTypes.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <Pressable
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: isSelected ? patientPalette.primary : patientPalette.panelSoft,
                  borderWidth: 1,
                  borderColor: isSelected ? "transparent" : patientPalette.lineSoft
                }}
              >
                <Text style={{ color: isSelected ? "#FFFFFF" : patientPalette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 13 }}>
                  {type.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {query.isLoading ? <Loader /> : null}
        {query.isError ? <ErrorState message="تعذر تحميل الأطباء المتاحين للاستشارة" onRetry={query.refetch} /> : null}
        {!query.isLoading && !query.isError && doctors.length === 0 ? (
          <EmptyState title="لا يوجد أطباء متاحون الآن" description="جرّب تخصصاً آخر أو عد لاحقاً." />
        ) : null}
        <View style={{ gap: 12 }}>
          {doctors.map((doctor) => {
            const isSelected = selectedDoctorId === doctor.id;
            return (
              <View
                key={doctor.id}
                style={{
                  borderRadius: 26,
                  borderWidth: 1.5,
                  borderColor: isSelected ? patientPalette.primary : "transparent"
                }}
              >
                <DoctorCard doctor={doctor} onPress={() => setSelectedDoctorId(doctor.id)} />
              </View>
            );
          })}
        </View>
      </PatientSurface>

      <PatientSurface style={{ gap: 14 }}>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 22 }}>2. أكمل بيانات الطلب</Text>
          <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right" }}>
            سيتم فتح المحادثة بعد إرسال الطلب مباشرة.
          </Text>
        </View>
        <InputField control={form.control} name="subject" label="عنوان الاستشارة" placeholder="مثال: صداع متكرر منذ أسبوع" />
        <InputField
          control={form.control}
          name="symptoms"
          label="الأعراض أو التفاصيل"
          multiline
          placeholder="اشرح الحالة باختصار، والأدوية المستخدمة إن وجدت"
        />
        <InputField control={form.control} name="preferredTime" label="الوقت المفضل للتواصل" placeholder="مثال: اليوم بعد المغرب" />
        {selectedDoctor ? (
          <View
            style={{
              borderRadius: 20,
              backgroundColor: patientPalette.panelSoft,
              borderWidth: 1,
              borderColor: patientPalette.lineSoft,
              paddingHorizontal: 16,
              paddingVertical: 14,
              alignItems: "flex-end",
              gap: 4
            }}
          >
            <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold" }}>الطبيب المختار: {selectedDoctor.fullName}</Text>
            <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium" }}>{selectedDoctor.specialization}</Text>
          </View>
        ) : null}
        <Button
          title="إرسال طلب الاستشارة"
          loading={submitting}
          disabled={!selectedDoctor}
          onPress={form.handleSubmit(async (values) => {
            if (!selectedDoctor) {
              return;
            }

            try {
              setSubmitting(true);
              showToast({
                title: "تم إرسال الطلب",
                description: `تم فتح مسار الاستشارة مع ${selectedDoctor.fullName}`
              });
              navigation.navigate("PatientTabs", { screen: "MessagesTab" });
            } finally {
              setSubmitting(false);
            }
          })}
        />
      </PatientSurface>
    </PatientScreen>
  );
}
