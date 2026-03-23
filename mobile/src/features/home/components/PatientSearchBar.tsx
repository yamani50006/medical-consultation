import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

import { usePatientPalette } from "@/features/home/components/patient-theme";

export function PatientSearchBar({
  value,
  onChangeText,
  placeholder = "ابحث عن طبيب أو تخصص...",
  onFilterPress,
  filterActive = false,
  filterCount = 0
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  filterActive?: boolean;
  filterCount?: number;
}) {
  const patientPalette = usePatientPalette();

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
      <Pressable
        onPress={onFilterPress}
        disabled={!onFilterPress}
        style={{
          width: 38,
          height: 38,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: filterActive ? patientPalette.primary : patientPalette.primarySoft,
          position: "relative",
          opacity: onFilterPress ? 1 : 0.82
        }}
      >
        <Ionicons name="options-outline" size={18} color={filterActive ? "#FFFFFF" : patientPalette.primary} />
        {filterCount > 0 ? (
          <View
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              minWidth: 18,
              height: 18,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 4,
              backgroundColor: patientPalette.accent,
              borderWidth: 1,
              borderColor: patientPalette.page
            }}
          >
            <Text style={{ color: "#FFFFFF", fontFamily: "Cairo_700Bold", fontSize: 10 }}>{filterCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
