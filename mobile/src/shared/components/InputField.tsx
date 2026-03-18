import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
};

export function InputField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  multiline,
  secureTextEntry
}: Props<T>) {
  const { theme } = useAppTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.wrapper}>
          <Text style={[styles.label, { color: theme.colors.text.primary }]}>{label}</Text>
          <TextInput
            value={value === undefined || value === null ? "" : String(value)}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.secondary}
            multiline={multiline}
            secureTextEntry={secureTextEntry}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.glass.surface,
                borderColor: error ? theme.colors.danger : theme.colors.glass.border,
                color: theme.colors.text.primary,
                height: multiline ? 120 : 54,
                textAlign: "right",
                writingDirection: "rtl"
              }
            ]}
          />
          {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: { fontFamily: "Cairo_600SemiBold", fontSize: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "Cairo_500Medium",
    fontSize: 15
  },
  error: { fontFamily: "Cairo_500Medium", fontSize: 12 }
});
