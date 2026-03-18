import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { DoctorSurface } from "@/features/doctor-panel/components/DoctorSurface";
import { doctorPalette } from "@/features/doctor-panel/components/doctor-theme";

export function DoctorMetricCard({
  title,
  value,
  subtitle,
  accent,
  icon,
  compact = false
}: {
  title: string;
  value: string;
  subtitle: string;
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
}) {
  return (
    <DoctorSurface style={{ flex: compact ? 1 : undefined, minHeight: compact ? 112 : 142 }}>
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${accent}22`
          }}
        >
          <Ionicons name={icon} size={22} color={accent} />
        </View>
        <View style={{ alignItems: "flex-end", gap: 3 }}>
          <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 13 }}>{title}</Text>
          <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: compact ? 28 : 34 }}>{value}</Text>
        </View>
      </View>
      <Text style={{ color: accent, fontFamily: "Cairo_600SemiBold", fontSize: 13, textAlign: "right", marginTop: "auto" }}>{subtitle}</Text>
    </DoctorSurface>
  );
}

