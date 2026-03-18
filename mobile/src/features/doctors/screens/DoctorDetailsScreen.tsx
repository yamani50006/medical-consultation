import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { formatCurrency } from "@/core/helpers/format";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { patientPalette } from "@/features/home/components/patient-theme";
import { useDoctorDetailsQuery } from "@/features/doctors";
import { PatientStackParamList } from "@/navigation/types";
import { Avatar } from "@/shared/components/Avatar";
import { Button } from "@/shared/components/Button";
import { ErrorState } from "@/shared/components/ErrorState";
import { Loader } from "@/shared/components/Loader";
import { RatingStars } from "@/shared/components/RatingStars";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { useState } from "react";

type Props = NativeStackScreenProps<PatientStackParamList, "DoctorDetails">;

export function DoctorDetailsScreen({ route, navigation }: Props) {
  const query = useDoctorDetailsQuery(route.params.doctorId);
  const [bookingLoading, setBookingLoading] = useState(false);

  if (query.isLoading) {
    return (
      <PatientScreen>
        <Loader />
      </PatientScreen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PatientScreen>
        <ErrorState message="تعذر تحميل بيانات الطبيب" onRetry={query.refetch} />
      </PatientScreen>
    );
  }

  const doctor = query.data;

  return (
    <PatientScreen>
      <ScreenHeader title="تفاصيل الطبيب" subtitle="راجع الملف ثم تابع إلى الحجز" />
      <PatientSurface style={{ alignItems: "center", gap: 14 }}>
        <Avatar name={doctor.fullName} size={88} />
        <View style={{ alignItems: "center", gap: 4 }}>
          <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 28 }}>{doctor.fullName}</Text>
          <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium" }}>{doctor.specialization}</Text>
          <View style={{ flexDirection: "row-reverse", gap: 8, alignItems: "center" }}>
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: `${patientPalette.primary}16` }}>
              <Text style={{ color: patientPalette.primary, fontFamily: "Cairo_700Bold", fontSize: 12 }}>{doctor.yearsOfExperience} سنة</Text>
            </View>
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: patientPalette.panelSoft }}>
              <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 12 }}>{doctor.isAvailableNow ? "متاح الآن" : "غير متاح"}</Text>
            </View>
          </View>
        </View>
      </PatientSurface>

      <View style={{ flexDirection: "row-reverse", gap: 12 }}>
        <StatBox icon="people" label="مرضى" value="1.2k+" />
        <StatBox icon="card" label="السعر" value={doctor.consultationFee ? formatCurrency(doctor.consultationFee) : "مرن"} />
        <StatBox icon="star" label="التقييم" value={doctor.rating.toFixed(1)} />
      </View>

      <PatientSurface>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ alignItems: "flex-end", gap: 4, flex: 1 }}>
            <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 20 }}>نبذة عن الطبيب</Text>
            <RatingStars rating={doctor.rating} count={doctor.reviewsCount} />
          </View>
        </View>
        <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", lineHeight: 28, textAlign: "right" }}>
          {doctor.bio ?? "طبيب بخبرة عملية في تقديم رعاية حديثة ومتابعة دقيقة للحالات الطبية المختلفة."}
        </Text>
      </PatientSurface>

      <PatientSurface>
        <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 18, textAlign: "right" }}>المواعيد المتاحة</Text>
        <View style={{ flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" }}>
          {["12 أكتوبر", "13 أكتوبر", "14 أكتوبر", "15 أكتوبر", "09:00", "10:30", "05:00", "07:00"].map((item, index) => (
            <View key={item} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: index % 3 === 0 ? `${patientPalette.primary}18` : patientPalette.panelSoft }}>
              <Text style={{ color: index % 3 === 0 ? patientPalette.primary : patientPalette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 13 }}>{item}</Text>
            </View>
          ))}
        </View>
      </PatientSurface>

      <Button
        title="حجز موعد"
        loading={bookingLoading}
        onPress={() => {
          setBookingLoading(true);
          navigation.navigate("Booking", { doctorId: doctor.id, doctorName: doctor.fullName });
        }}
      />
      <Button title="طلب استشارة" variant="secondary" onPress={() => navigation.navigate("ConsultationRequest")} />
    </PatientScreen>
  );
}

function StatBox({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <PatientSurface style={{ flex: 1, alignItems: "center", gap: 8, paddingVertical: 14 }}>
      <Ionicons name={icon} size={18} color={patientPalette.primary} />
      <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 18 }}>{value}</Text>
      <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 12 }}>{label}</Text>
    </PatientSurface>
  );
}
