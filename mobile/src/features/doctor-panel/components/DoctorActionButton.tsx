import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { doctorPalette } from "@/features/doctor-panel/components/doctor-theme";

export function DoctorActionButton({
  label,
  icon,
  active = false
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
}) {
  return (
    <Pressable
      style={{
        minWidth: 116,
        paddingHorizontal: 18,
        minHeight: 56,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row-reverse",
        gap: 8,
        backgroundColor: active ? doctorPalette.primary : doctorPalette.panelSoft,
        borderWidth: 1,
        borderColor: active ? "transparent" : doctorPalette.lineSoft
      }}
    >
      <Ionicons name={icon} size={18} color={active ? "#FFFFFF" : doctorPalette.textMuted} />
      <Text style={{ color: active ? "#FFFFFF" : doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

