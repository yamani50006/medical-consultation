import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DoctorAppointmentCard } from "@/features/doctor-panel/components/DoctorAppointmentCard";
import { DoctorSurface } from "@/features/doctor-panel/components/DoctorSurface";
import { doctorPalette } from "@/features/doctor-panel/components/doctor-theme";
import { doctorUpcomingAppointments } from "@/features/doctor-panel/data/mock-doctor-data";

export function DoctorAppointmentsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: doctorPalette.page }}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 18 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ width: 48, height: 48, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: doctorPalette.panel, borderWidth: 1, borderColor: doctorPalette.lineSoft }}>
            <Ionicons name="arrow-forward" size={22} color={doctorPalette.text} />
          </View>
          <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 28 }}>مواعيدي</Text>
          <View style={{ width: 48, height: 48, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: doctorPalette.panel, borderWidth: 1, borderColor: doctorPalette.lineSoft }}>
            <Ionicons name="search" size={22} color={doctorPalette.textMuted} />
          </View>
        </View>

        <DoctorSurface style={{ padding: 8 }}>
          <View style={{ flexDirection: "row-reverse", gap: 8 }}>
            <View style={{ flex: 1, minHeight: 44, borderRadius: 16, backgroundColor: doctorPalette.primary, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#FFFFFF", fontFamily: "Cairo_700Bold" }}>القادمة</Text>
            </View>
            <View style={{ flex: 1, minHeight: 44, borderRadius: 16, backgroundColor: doctorPalette.panelSoft, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_700Bold" }}>السابقة</Text>
            </View>
          </View>
        </DoctorSurface>

        {doctorUpcomingAppointments.map((item) => (
          <DoctorAppointmentCard key={item.id} {...item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

