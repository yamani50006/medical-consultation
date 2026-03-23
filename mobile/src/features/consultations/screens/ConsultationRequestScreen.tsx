import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";

import { ConsultationButton } from "@/features/consultations/components/ConsultationButton";
import { ConsultationDoctorPickerCard } from "@/features/consultations/components/ConsultationDoctorPickerCard";
import { ConsultationErrorState } from "@/features/consultations/components/ConsultationErrorState";
import { ConsultationHeader } from "@/features/consultations/components/ConsultationHeader";
import { ConsultationLoader } from "@/features/consultations/components/ConsultationLoader";
import { ConsultationScreenLayout } from "@/features/consultations/components/ConsultationScreenLayout";
import { ConsultationSurface } from "@/features/consultations/components/ConsultationSurface";
import { ConsultationTextField } from "@/features/consultations/components/ConsultationTextField";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import { useCreateConsultationMutation } from "@/features/consultations/hooks/useConsultationMutations";
import { useDoctorsQuery } from "@/features/doctors/hooks/useDoctorQueries";
import { PatientStackParamList } from "@/navigation/types";

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
  const palette = useConsultationTheme();
  const [search, setSearch] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<(typeof consultationTypes)[number]["id"]>("online");
  const query = useDoctorsQuery(search ? { search, consultationMode: "online" } : { consultationMode: "online" });
  const createConsultationMutation = useCreateConsultationMutation();
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
    <ConsultationScreenLayout>
      <ConsultationHeader title="طلب استشارة" subtitle="اختر الطبيب ثم أكمل تفاصيل الاستشارة" />
      <ConsultationSurface style={{ gap: 14 }}>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 22 }}>1. اختر الطبيب المناسب</Text>
          <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right" }}>
            البحث هنا مخصص للأطباء المتاحين للاستشارة عن بُعد.
          </Text>
        </View>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث باسم الطبيب أو التخصص..."
          placeholderTextColor={palette.textSoft}
          style={{
            minHeight: 54,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: palette.border,
            backgroundColor: palette.surfaceMuted,
            color: palette.text,
            paddingHorizontal: 16,
            fontFamily: "Cairo_500Medium",
            textAlign: "right",
            writingDirection: "rtl"
          }}
        />
        <View style={{ flexDirection: "row-reverse", gap: 8, flexWrap: "wrap"  }}>
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
                  backgroundColor: isSelected ? palette.primary : palette.surfaceMuted,
                  borderWidth: 1,
                  borderColor: isSelected ? "transparent" : palette.border
                }}
              >
                <Text
                  style={{
                    color: isSelected ? palette.contrastText : palette.textMuted,
                    fontFamily: "Cairo_700Bold",
                    fontSize: 13
                  }}
                >
                  {type.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {query.isLoading ? <ConsultationLoader /> : null}
        {query.isError ? <ConsultationErrorState message="تعذر تحميل الأطباء المتاحين للاستشارة" onRetry={query.refetch} /> : null}
        {!query.isLoading && !query.isError && doctors.length === 0 ? (
          <ConsultationSurface style={{ alignItems: "center" }}>
            <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 18 }}>
              لا يوجد أطباء متاحون الآن
            </Text>
            <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "center", lineHeight: 22 }}>
              جرّب تخصصاً آخر أو عد لاحقاً.
            </Text>
          </ConsultationSurface>
        ) : null}
        <View style={{ gap: 12 }}>
          {doctors.map((doctor) => {
            return (
              <ConsultationDoctorPickerCard
                key={doctor.id}
                doctor={doctor}
                selected={selectedDoctorId === doctor.id}
                onPress={() => setSelectedDoctorId(doctor.id)}
              />
            );
          })}
        </View>
      </ConsultationSurface>

      <ConsultationSurface style={{ gap: 14 }}>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 22 }}>2. أكمل بيانات الطلب</Text>
          <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right" }}>
            سيتم إنشاء الطلب وإظهاره مباشرة داخل صفحة "استشاراتي".
          </Text>
        </View>
        <ConsultationTextField control={form.control} name="subject" label="عنوان الاستشارة" placeholder="مثال: صداع متكرر منذ أسبوع" />
        <ConsultationTextField
          control={form.control}
          name="symptoms"
          label="الأعراض أو التفاصيل"
          multiline
          placeholder="اشرح الحالة باختصار، والأدوية المستخدمة إن وجدت"
        />
        <ConsultationTextField control={form.control} name="preferredTime" label="الوقت المفضل للتواصل" placeholder="مثال: اليوم بعد المغرب" />
        {selectedDoctor ? (
          <View
            style={{
              borderRadius: 20,
              backgroundColor: palette.surfaceMuted,
              borderWidth: 1,
              borderColor: palette.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
              alignItems: "flex-end",
              gap: 4
            }}
          >
            <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold" }}>الطبيب المختار: {selectedDoctor.fullName}</Text>
            <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium" }}>{selectedDoctor.specialization}</Text>
          </View>
        ) : null}
        <ConsultationButton
          title="إرسال طلب الاستشارة"
          loading={createConsultationMutation.isPending}
          disabled={!selectedDoctor}
          onPress={form.handleSubmit(async (values) => {
            if (!selectedDoctor) {
              return;
            }

            await createConsultationMutation.mutateAsync({
              doctorId: selectedDoctor.id,
              doctorName: selectedDoctor.fullName,
              doctorAvatarUrl: selectedDoctor.profileImageUrl,
              specialization: selectedDoctor.specialization,
              subject: values.subject,
              description: values.symptoms,
              preferredTime: values.preferredTime,
              requestType: selectedType
            });

            navigation.replace("MyConsultations");
          })}
        />
      </ConsultationSurface>
    </ConsultationScreenLayout>
  );
}
