import { ActivityIndicator, View } from "react-native";

import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

export function ConsultationLoader() {
  const palette = useConsultationTheme();

  return (
    <View style={{ paddingVertical: 40, alignItems: "center" }}>
      <ActivityIndicator size="large" color={palette.primary} />
    </View>
  );
}
