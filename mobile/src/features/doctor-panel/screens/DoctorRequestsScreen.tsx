import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ConsultationRequestCard } from "@/features/doctor-panel/components/ConsultationRequestCard";
import { DoctorSurface } from "@/features/doctor-panel/components/DoctorSurface";
import { doctorPalette } from "@/features/doctor-panel/components/doctor-theme";
import { consultationRequests } from "@/features/doctor-panel/data/mock-doctor-data";

export function DoctorRequestsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: doctorPalette.page }}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 18 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ width: 48, height: 48, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: doctorPalette.panel, borderWidth: 1, borderColor: doctorPalette.lineSoft }}>
            <Ionicons name="menu" size={22} color={doctorPalette.textMuted} />
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: doctorPalette.panel, borderWidth: 1, borderColor: doctorPalette.lineSoft }}>
            <Ionicons name="notifications" size={21} color={doctorPalette.primary} />
          </View>
        </View>

        <View style={{ alignItems: "center", gap: 2 }}>
          <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 28 }}>طلبات الاستشارة</Text>
        </View>

        <DoctorSurface style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
          <View style={{ flexDirection: "row-reverse", justifyContent: "space-between" }}>
            {["الجديدة", "قيد الانتظار", "المكتملة"].map((item, index) => (
              <View key={item} style={{ alignItems: "center", flex: 1, paddingBottom: 10, borderBottomWidth: index === 0 ? 2 : 0, borderBottomColor: doctorPalette.primary }}>
                <Text style={{ color: index === 0 ? doctorPalette.primary : doctorPalette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 14 }}>{item}</Text>
              </View>
            ))}
          </View>
        </DoctorSurface>

        {consultationRequests.map((item) => (
          <ConsultationRequestCard key={item.id} {...item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

