import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text, View } from "react-native";

import { useDoctorsQuery } from "@/features/doctors/hooks/useDoctorQueries";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSearchBar } from "@/features/home/components/PatientSearchBar";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { usePatientPalette } from "@/features/home/components/patient-theme";
import { PatientStackParamList } from "@/navigation/types";
import { Button } from "@/shared/components/Button";
import { DoctorCard } from "@/shared/components/DoctorCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Loader } from "@/shared/components/Loader";
import { ScreenHeader } from "@/shared/components/ScreenHeader";

type Props = NativeStackScreenProps<PatientStackParamList, "StartBooking">;

export function StartBookingScreen({ navigation }: Props) {
  const [search, setSearch] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const query = useDoctorsQuery(search ? { search } : undefined);
  const patientPalette = usePatientPalette();
  const doctors = query.data ?? [];
  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedDoctorId) ?? null;

  return (
    <PatientScreen>
      <ScreenHeader title="حجز موعد" subtitle="اختر الطبيب ثم انتقل إلى تثبيت الموعد" />
      <PatientSurface style={{ gap: 14 }}>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 22 }}>1. اختر الطبيب</Text>
          <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right" }}>
            يمكنك البحث بالاسم أو التخصص قبل متابعة الحجز.
          </Text>
        </View>
        <PatientSearchBar value={search} onChangeText={setSearch} placeholder="ابحث باسم الطبيب أو التخصص..." />
        {query.isLoading ? <Loader /> : null}
        {query.isError ? <ErrorState message="تعذر تحميل الأطباء" onRetry={query.refetch} /> : null}
        {!query.isLoading && !query.isError && doctors.length === 0 ? (
          <EmptyState title="لا يوجد أطباء مطابقون" description="جرّب تعديل البحث أو اختيار تخصص آخر." />
        ) : null}
        <View style={{ gap: 12 }}>
          {doctors.map((doctor) => (
            <View
              key={doctor.id}
              style={{
                borderRadius: 26,
                borderWidth: 1.5,
                borderColor: selectedDoctorId === doctor.id ? patientPalette.primary : "transparent"
              }}
            >
              <DoctorCard doctor={doctor} onPress={() => setSelectedDoctorId(doctor.id)} />
            </View>
          ))}
        </View>
      </PatientSurface>

      <PatientSurface style={{ gap: 12 }}>
        <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 20, textAlign: "right" }}>2. متابعة التثبيت</Text>
        <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", lineHeight: 24, textAlign: "right" }}>
          بعد اختيار الطبيب ستنتقل مباشرة إلى صفحة الموعد لاختيار التاريخ والوقت المناسبين.
        </Text>
        <Button
          title={selectedDoctor ? `متابعة مع ${selectedDoctor.fullName}` : "اختر الطبيب أولاً"}
          disabled={!selectedDoctor}
          onPress={() => {
            if (!selectedDoctor) {
              return;
            }

            navigation.navigate("Booking", {
              doctorId: selectedDoctor.id,
              doctorName: selectedDoctor.fullName
            });
          }}
        />
      </PatientSurface>
    </PatientScreen>
  );
}
