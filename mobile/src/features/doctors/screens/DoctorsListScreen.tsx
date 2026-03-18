import { useNavigation } from "@react-navigation/native";
import { Pressable, Text, View } from "react-native";

import { useDoctorsQuery } from "@/features/doctors";
import { PatientHeader } from "@/features/home/components/PatientHeader";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSearchBar } from "@/features/home/components/PatientSearchBar";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { patientPalette } from "@/features/home/components/patient-theme";
import { DoctorCard } from "@/shared/components/DoctorCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Loader } from "@/shared/components/Loader";
import { useState } from "react";

const filters = ["الكل", "جلدية", "قلب", "أطفال", "أسنان"];

export function DoctorsListScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("الكل");
  const query = useDoctorsQuery({
    search: search || undefined,
    specialization: selected === "الكل" ? undefined : selected
  });

  return (
    <PatientScreen>
      <PatientHeader title="الأطباء" subtitle="اختر الطبيب الأنسب لحالتك" />
      <PatientSearchBar value={search} onChangeText={setSearch} />
      <View style={{ flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" }}>
        {filters.map((item) => {
          const active = item === selected;
          return (
            <Pressable
              key={item}
              onPress={() => setSelected(item)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? patientPalette.primary : patientPalette.panel,
                borderWidth: 1,
                borderColor: active ? "transparent" : patientPalette.glassBorder
              }}
            >
              <Text style={{ color: active ? "#FFFFFF" : patientPalette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 13 }}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState message="تعذر تحميل الأطباء" onRetry={query.refetch} /> : null}
      {!query.isLoading && query.data?.length === 0 ? <EmptyState title="لا يوجد نتائج" description="جرّب تخصصًا آخر أو ابحث باسم الطبيب." /> : null}

      <View style={{ gap: 14 }}>
        {query.data?.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} onPress={() => navigation.navigate("DoctorDetails", { doctorId: doctor.id })} />
        ))}
      </View>

      <PatientSurface>
        <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 18, textAlign: "right" }}>بحث ذكي</Text>
        <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", lineHeight: 24, textAlign: "right" }}>
          جرّب لاحقًا فلترة حسب الشهرة، السعر، أو القرب الجغرافي بنفس أسلوب المنصة.
        </Text>
      </PatientSurface>
    </PatientScreen>
  );
}
