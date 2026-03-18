import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DoctorActionButton } from "@/features/doctor-panel/components/DoctorActionButton";
import { DoctorAppointmentCard } from "@/features/doctor-panel/components/DoctorAppointmentCard";
import { DoctorMetricCard } from "@/features/doctor-panel/components/DoctorMetricCard";
import { DoctorSurface } from "@/features/doctor-panel/components/DoctorSurface";
import { doctorPalette } from "@/features/doctor-panel/components/doctor-theme";
import {
  doctorMetrics,
  doctorQuickActions,
  doctorUpcomingAppointments
} from "@/features/doctor-panel/data/mock-doctor-data";

export function DoctorDashboardScreen() {
  const heroMetric = doctorMetrics[0];
  const smallMetrics = doctorMetrics.slice(1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: doctorPalette.page }}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 18 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: doctorPalette.panel,
              borderWidth: 1,
              borderColor: doctorPalette.lineSoft
            }}
          >
            <Ionicons name="notifications" size={21} color={doctorPalette.text} />
          </View>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12 }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "#D4F3EF", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: doctorPalette.primary }}>
              <Ionicons name="medical" size={24} color={doctorPalette.page} />
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 13 }}>مرحبًا مجددًا</Text>
              <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 26 }}>أهلاً د. أحمد</Text>
            </View>
          </View>
        </View>

        <DoctorMetricCard {...heroMetric} />

        <View style={{ flexDirection: "row-reverse", gap: 12 }}>
          {smallMetrics.map((item) => (
            <DoctorMetricCard key={item.id} {...item} compact />
          ))}
        </View>

        <View style={{ alignItems: "flex-end", gap: 12 }}>
          <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 24 }}>إجراءات سريعة</Text>
          <View style={{ flexDirection: "row-reverse", gap: 10 }}>
            {doctorQuickActions.map((item, index) => (
              <DoctorActionButton key={item.id} label={item.label} icon={item.icon} active={index === 0} />
            ))}
          </View>
        </View>

        <DoctorSurface style={{ minHeight: 152, justifyContent: "space-between", backgroundColor: "#129C98" }}>
          <View style={{ position: "absolute", left: 18, top: 18, width: 100, height: 100, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="medkit" size={54} color="rgba(255,255,255,0.22)" />
          </View>
          <View style={{ alignItems: "flex-end", paddingLeft: 84 }}>
            <Text style={{ color: "#FFFFFF", fontFamily: "Cairo_700Bold", fontSize: 28 }}>صحتك تهمنا</Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", fontFamily: "Cairo_500Medium", lineHeight: 24, textAlign: "right" }}>
              احصل على استشارة مجانية لأول مرة مع فحص مبدئي من الأطباء.
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={{ backgroundColor: "#FFFFFF", paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999 }}>
              <Text style={{ color: doctorPalette.primary, fontFamily: "Cairo_700Bold", fontSize: 14 }}>اكتشف الآن</Text>
            </View>
          </View>
        </DoctorSurface>

        <View style={{ alignItems: "flex-end", gap: 12 }}>
          <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 24 }}>المواعيد القادمة</Text>
          {doctorUpcomingAppointments.map((item) => (
            <DoctorAppointmentCard key={item.id} {...item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

