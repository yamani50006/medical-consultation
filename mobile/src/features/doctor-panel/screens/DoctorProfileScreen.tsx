import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DoctorSurface } from "@/features/doctor-panel/components/DoctorSurface";
import { doctorPalette } from "@/features/doctor-panel/components/doctor-theme";

export function DoctorProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: doctorPalette.page }}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 18 }} showsVerticalScrollIndicator={false}>
        <DoctorSurface style={{ alignItems: "center", paddingVertical: 28 }}>
          <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: "#D7F2EF", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: doctorPalette.primary }}>
            <Ionicons name="medical" size={36} color={doctorPalette.page} />
          </View>
          <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 28, marginTop: 14 }}>د. أحمد محمد</Text>
          <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_500Medium" }}>استشاري أمراض القلب</Text>
        </DoctorSurface>

        {[
          ["أوقات العمل", "الأحد - الخميس • 9:00 ص إلى 5:00 م"],
          ["الاستشارات", "أونلاين وحضوري"],
          ["الملف الشخصي", "تحديث السيرة المهنية وبيانات العيادة"],
          ["الإشعارات", "إدارة تنبيهات الحجوزات والاستشارات"]
        ].map(([title, subtitle]) => (
          <DoctorSurface key={title} style={{ paddingVertical: 16 }}>
            <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 18, textAlign: "right" }}>{title}</Text>
            <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_500Medium", lineHeight: 24, textAlign: "right", marginTop: 6 }}>{subtitle}</Text>
          </DoctorSurface>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

