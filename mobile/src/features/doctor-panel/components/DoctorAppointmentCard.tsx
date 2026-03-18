import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { DoctorSurface } from "@/features/doctor-panel/components/DoctorSurface";
import { doctorPalette } from "@/features/doctor-panel/components/doctor-theme";

export function DoctorAppointmentCard({
  patientName,
  time,
  status,
  avatarColor
}: {
  patientName: string;
  time: string;
  status: string;
  avatarColor: string;
}) {
  const tone = status === "قيد الانتظار" ? doctorPalette.yellow : doctorPalette.green;

  return (
    <DoctorSurface style={{ padding: 16 }}>
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: avatarColor
          }}
        >
          <Ionicons name="person" size={22} color={doctorPalette.page} />
        </View>
        <View style={{ flex: 1, alignItems: "flex-end", gap: 2 }}>
          <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 18 }}>{patientName}</Text>
          <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 13 }}>متابعة علاجية</Text>
        </View>
      </View>

      <View style={{ alignSelf: "flex-end", marginTop: 10, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: `${tone}18`, borderWidth: 1, borderColor: `${tone}30` }}>
        <Text style={{ color: tone, fontFamily: "Cairo_700Bold", fontSize: 12 }}>{status}</Text>
      </View>

      <View
        style={{
          marginTop: 14,
          borderRadius: 18,
          backgroundColor: doctorPalette.panelSoft,
          borderWidth: 1,
          borderColor: doctorPalette.lineSoft,
          paddingHorizontal: 14,
          paddingVertical: 12,
          flexDirection: "row-reverse",
          justifyContent: "space-between"
        }}
      >
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
          <Ionicons name="time" size={16} color={doctorPalette.primary} />
          <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_600SemiBold", fontSize: 13 }}>{time}</Text>
        </View>
        <View style={{ width: 1, backgroundColor: doctorPalette.line }} />
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
          <Ionicons name="calendar" size={16} color={doctorPalette.primary} />
          <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_600SemiBold", fontSize: 13 }}>15 أكتوبر 2023</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row-reverse", gap: 12, marginTop: 14 }}>
        <View style={{ flex: 1 }}>
          <DoctorActionButtonSimple title="إعادة جدولة" primary />
        </View>
        <View style={{ flex: 1 }}>
          <DoctorActionButtonSimple title="إلغاء الموعد" />
        </View>
      </View>
    </DoctorSurface>
  );
}

function DoctorActionButtonSimple({ title, primary = false }: { title: string; primary?: boolean }) {
  return (
    <View
      style={{
        minHeight: 48,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: primary ? doctorPalette.primary : "#243145",
        borderWidth: 1,
        borderColor: primary ? "transparent" : doctorPalette.lineSoft
      }}
    >
      <Text style={{ color: primary ? "#FFFFFF" : doctorPalette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 14 }}>{title}</Text>
    </View>
  );
}

