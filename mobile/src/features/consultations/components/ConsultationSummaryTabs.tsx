import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import { entranceAnimation } from "@/shared/animations/presets";

type ConsultationSummaryTabItem = {
  id: string;
  label: string;
  value: number;
  active?: boolean;
  onPress?: () => void;
};

export function ConsultationSummaryTabs({
  items
}: {
  items: ConsultationSummaryTabItem[];
}) {
  const palette = useConsultationTheme();

  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <Animated.View key={item.id} entering={entranceAnimation.delay(index * 40)} style={styles.item}>
          <Pressable
            onPress={item.onPress}
            style={[
              styles.card,
              {
                backgroundColor: item.active ? `${palette.primary}20` : palette.surfaceStrong,
                borderColor: item.active ? `${palette.primary}36` : palette.border
              }
            ]}
          >
            <Text style={[styles.value, { color: item.active ? palette.primary : palette.text }]}>
              {item.value}
            </Text>
            <Text style={[styles.label, { color: item.active ? palette.text : palette.textMuted }]}>
              {item.label}
            </Text>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    gap: 12
  },
  item: {
    flex: 1
  },
  card: {
    minHeight: 88,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 12
  },
  value: {
    fontFamily: "Cairo_700Bold",
    fontSize: 34,
    lineHeight: 40
  },
  label: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13
  }
});
