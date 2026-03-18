import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";

import { useBookAppointmentMutation, useBookingForm } from "@/features/appointments";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { patientPalette } from "@/features/home/components/patient-theme";
import { PatientStackParamList } from "@/navigation/types";
import { Button } from "@/shared/components/Button";
import { InputField } from "@/shared/components/InputField";
import { ScreenHeader } from "@/shared/components/ScreenHeader";

type Props = NativeStackScreenProps<PatientStackParamList, "Booking">;

export function BookingScreen({ route, navigation }: Props) {
  const form = useBookingForm();
  const book = useBookAppointmentMutation(route.params.doctorId);

  return (
    <PatientScreen>
      <ScreenHeader title="حجز موعد" subtitle="يمكنك الرجوع وتعديل الاختيار في أي وقت" />
      <PatientSurface style={{ minHeight: 120, justifyContent: "space-between" }}>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 26 }}>متابعة الحجز</Text>
          <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium" }}>
            ثبّت اليوم والوقت المناسب مع الطبيب
          </Text>
        </View>
        <Text style={{ color: patientPalette.primary, fontFamily: "Cairo_700Bold", textAlign: "right" }}>
          الطبيب: {route.params.doctorName ?? "الطبيب المختار"}
        </Text>
      </PatientSurface>

      <PatientSurface style={{ borderRadius: 32 }}>
        <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 18, textAlign: "right" }}>اختر الموعد</Text>
        <View style={{ flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" }}>
          {["05", "04", "03", "02", "01", "12", "11", "10", "09", "08"].map((item, index) => (
            <View key={item} style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: index === 0 ? patientPalette.primary : patientPalette.panelSoft }}>
              <Text style={{ color: index === 0 ? "#FFFFFF" : patientPalette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 13 }}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" }}>
          {["AM 10:00", "AM 10:30", "AM 11:30", "PM 02:00", "PM 03:30", "PM 05:00"].map((item, index) => (
            <View key={item} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: index === 0 ? `${patientPalette.primary}20` : patientPalette.panelSoft }}>
              <Text style={{ color: index === 0 ? patientPalette.primary : patientPalette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 13 }}>{item}</Text>
            </View>
          ))}
        </View>
        <InputField control={form.control} name="appointmentDate" label="التاريخ والوقت" placeholder="2026-03-20T10:00:00.000Z" />
        <InputField control={form.control} name="notes" label="ملاحظات للحالة" multiline placeholder="اكتب الأعراض أو ما تود إيصاله للطبيب" />
        <Button
          title="تأكيد الحجز"
          loading={book.isPending}
          onPress={form.handleSubmit(async (values) => {
            await book.mutateAsync(values);
            navigation.goBack();
          })}
        />
      </PatientSurface>
    </PatientScreen>
  );
}
