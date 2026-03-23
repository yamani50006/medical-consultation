import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

type Item = {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number;
};

export function ConsultationFilterTabs({
  items,
  activeId,
  onChange,
  variant = "primary"
}: {
  items: Item[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "primary" | "secondary";
}) {
  const palette = useConsultationTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.row}>
        {items.map((item) => {
          const isActive = item.id === activeId;
          const activeTone = variant === "primary" ? palette.tones.brand : palette.tones.accent;
          const tone = isActive ? activeTone : palette.tones.neutral;

          return (
            <Pressable
              key={item.id}
              onPress={() => onChange(item.id)}
              style={[
                styles.tab,
                {
                  minHeight: variant === "primary" ? 50 : 44,
                  minWidth: variant === "primary" ? 110 : 96,
                  borderRadius: variant === "primary" ? 22 : 999,
                  borderColor: isActive ? tone.border : "transparent",
                  backgroundColor: isActive ? tone.solid : palette.surfaceStrong
                }
              ]}
            >
                <View style={styles.labelRow}>
                {item.icon ? (
                  <Ionicons name={item.icon} size={14} color={isActive ? palette.contrastText : palette.textMuted} />
                ) : null}
                <Text
                  style={{
                    color: isActive ? palette.contrastText : palette.textMuted,
                    fontFamily: "Cairo_700Bold",
                    fontSize: 13
                  }}
                >
                  {item.label}
                </Text>
              </View>
              {item.count !== undefined ? (
                <Text
                  style={{
                    color: isActive ? palette.contrastText : palette.textSoft,
                    fontFamily: "Cairo_600SemiBold",
                    fontSize: 12
                  }}
                >
                  {item.count}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 2
  },
  row: {
    flexDirection: "row-reverse",
    gap: 10
  },
  tab: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 16,
    paddingVertical: 9
  },
  labelRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6
  }
});
