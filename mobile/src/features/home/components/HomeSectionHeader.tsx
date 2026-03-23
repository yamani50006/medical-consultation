import { Pressable, Text, View } from "react-native";

import { usePatientPalette } from "@/features/home/components/patient-theme";

export function HomeSectionHeader({
  title,
  actionLabel,
  onActionPress
}: {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  const patientPalette = usePatientPalette();

  return (
    <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 26 }}>
        {title}
      </Text>
      {actionLabel ? (
        <Pressable onPress={onActionPress}>
          <Text style={{ color: patientPalette.primary, fontFamily: "Cairo_700Bold", fontSize: 15 }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : <View />}
    </View>
  );
}
