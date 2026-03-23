import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  multiline?: boolean;
};

export function ConsultationTextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  multiline
}: Props<T>) {
  const palette = useConsultationTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.wrapper}>
          <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
          <TextInput
            value={value === undefined || value === null ? "" : String(value)}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={palette.textSoft}
            multiline={multiline}
            style={[
              styles.input,
              {
                backgroundColor: palette.surfaceMuted,
                borderColor: error ? palette.danger : palette.border,
                color: palette.text,
                height: multiline ? 120 : 54
              }
            ]}
          />
          {error ? <Text style={[styles.error, { color: palette.danger }]}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: { fontFamily: "Cairo_600SemiBold", fontSize: 14, textAlign: "right" },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "Cairo_500Medium",
    fontSize: 15,
    textAlign: "right",
    writingDirection: "rtl"
  },
  error: { fontFamily: "Cairo_500Medium", fontSize: 12, textAlign: "right" }
});
