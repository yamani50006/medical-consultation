import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { DoctorSurface } from "@/features/doctor-panel/components/DoctorSurface";
import { doctorPalette } from "@/features/doctor-panel/components/doctor-theme";

export function ConsultationRequestCard({
  patientName,
  priority,
  timeAgo,
  summary
}: {
  patientName: string;
  priority: string;
  timeAgo: string;
  summary: string;
}) {
  const tone = priority === "عاجل جدًا" ? doctorPalette.red : priority === "متابعة دورية" ? doctorPalette.yellow : doctorPalette.primary;

  return (
    <DoctorSurface style={{ padding: 16 }}>
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${tone}20`
          }}
        >
          <Ionicons name="person" size={22} color={tone} />
        </View>
        <View style={{ flex: 1, alignItems: "flex-end", gap: 2 }}>
          <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 18 }}>{patientName}</Text>
          <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 12 }}>{timeAgo}</Text>
        </View>
      </View>

      <View style={{ alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: `${tone}18`, borderWidth: 1, borderColor: `${tone}2E` }}>
        <Text style={{ color: tone, fontFamily: "Cairo_700Bold", fontSize: 12 }}>{priority}</Text>
      </View>

      <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_500Medium", lineHeight: 28, textAlign: "right", marginTop: 14 }}>
        {summary}
      </Text>

      <View style={{ flexDirection: "row-reverse", gap: 12, marginTop: 16 }}>
        <View style={{ flex: 1 }}>
          <RequestAction title="قبول الطلب" primary />
        </View>
        <View style={{ flex: 1 }}>
          <RequestAction title="رفض" />
        </View>
      </View>
      <View style={{ marginTop: 12 }}>
        <RequestAction title="التفاصيل الكاملة" outlined icon="eye" />
      </View>
    </DoctorSurface>
  );
}

function RequestAction({
  title,
  primary = false,
  outlined = false,
  icon
}: {
  title: string;
  primary?: boolean;
  outlined?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      style={{
        minHeight: 48,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row-reverse",
        gap: 8,
        backgroundColor: primary ? doctorPalette.primary : outlined ? "transparent" : "#243145",
        borderWidth: 1,
        borderColor: outlined ? `${doctorPalette.primary}55` : primary ? "transparent" : doctorPalette.lineSoft
      }}
    >
      {icon ? <Ionicons name={icon} size={16} color={outlined ? doctorPalette.primary : "#FFFFFF"} /> : null}
      <Text style={{ color: primary ? "#FFFFFF" : outlined ? doctorPalette.primary : doctorPalette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 14 }}>{title}</Text>
    </View>
  );
}

