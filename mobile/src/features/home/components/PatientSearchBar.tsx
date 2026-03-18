import { Ionicons } from "@expo/vector-icons";
import { TextInput, View } from "react-native";

import { patientPalette } from "@/features/home/components/patient-theme";

export function PatientSearchBar({
  value,
  onChangeText,
  placeholder = "ابحث عن طبيب أو تخصص..."
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <View
      style={{
        minHeight: 58,
        borderRadius: 22,
        backgroundColor: patientPalette.panel,
        borderWidth: 1,
        borderColor: patientPalette.glassBorder,
        flexDirection: "row-reverse",
        alignItems: "center",
        paddingHorizontal: 16,
        gap: 10
      }}
    >
      <Ionicons name="search" size={20} color={patientPalette.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={patientPalette.textMuted}
        style={{
          flex: 1,
          color: patientPalette.text,
          textAlign: "right",
          writingDirection: "rtl",
          fontFamily: "Cairo_500Medium"
        }}
      />
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: patientPalette.primarySoft
        }}
      >
        <Ionicons name="options" size={18} color={patientPalette.primary} />
      </View>
    </View>
  );
}
