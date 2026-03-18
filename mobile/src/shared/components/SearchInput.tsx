import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function SearchInput({
  value,
  onChangeText,
  placeholder = "ابحث عن الطبيب أو التخصص"
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.glass.surface, borderColor: theme.colors.glass.border }]}>
      <Ionicons name="search-outline" size={20} color={theme.colors.text.secondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.secondary}
        style={[styles.input, { color: theme.colors.text.primary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 56,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16
  },
  input: {
    flex: 1,
    textAlign: "right",
    writingDirection: "rtl",
    fontFamily: "Cairo_500Medium"
  }
});
