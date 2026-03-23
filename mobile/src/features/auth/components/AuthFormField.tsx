import { Ionicons } from "@expo/vector-icons";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { KeyboardTypeOptions, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { useState } from "react";

import { authPalette } from "@/features/auth/components/auth-theme";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  textContentType?: TextInputProps["textContentType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
  multiline?: boolean;
  secureTextEntry?: boolean;
  inputMode?: TextInputProps["inputMode"];
  editable?: boolean;
  description?: string;
  containerStyle?: ViewStyle;
};

export function AuthFormField<T extends FieldValues>({
  control,
  name,
  label,
  icon,
  placeholder,
  keyboardType,
  textContentType,
  autoCapitalize = "none",
  autoCorrect = false,
  multiline,
  secureTextEntry,
  inputMode,
  editable = true,
  description,
  containerStyle
}: Props<T>) {
  const [isHidden, setIsHidden] = useState(Boolean(secureTextEntry));
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={[styles.wrapper, containerStyle]}>
          <Text style={styles.label}>{label}</Text>
          <View
            style={[
              styles.inputShell,
              multiline && styles.multilineShell,
              isFocused && styles.inputShellActive,
              error && styles.inputShellError
            ]}
          >
            <Ionicons name={icon} size={18} color={error ? authPalette.danger : authPalette.textSoft} />
            <TextInput
              value={value === undefined || value === null ? "" : String(value)}
              onChangeText={onChange}
              onBlur={() => {
                setIsFocused(false);
                onBlur();
              }}
              onFocus={() => setIsFocused(true)}
              placeholder={placeholder}
              placeholderTextColor={authPalette.textSoft}
              keyboardType={keyboardType}
              textContentType={textContentType}
              autoCapitalize={autoCapitalize}
              autoCorrect={autoCorrect}
              multiline={multiline}
              secureTextEntry={secureTextEntry ? isHidden : false}
              inputMode={inputMode}
              editable={editable}
              style={[styles.input, multiline && styles.multilineInput]}
            />
            {secureTextEntry ? (
              <Pressable onPress={() => setIsHidden((current) => !current)} hitSlop={10}>
                <Ionicons name={isHidden ? "eye-off-outline" : "eye-outline"} size={18} color={authPalette.textSoft} />
              </Pressable>
            ) : null}
          </View>
          {error ? <Text style={styles.error}>{error.message}</Text> : description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 7
  },
  label: {
    color: authPalette.accentStrong,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
    textAlign: "right"
  },
  inputShell: {
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: authPalette.inputBorder,
    backgroundColor: authPalette.input,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16
  },
  inputShellActive: {
    borderColor: "rgba(108, 231, 224, 0.38)",
    backgroundColor: authPalette.inputActive
  },
  inputShellError: {
    borderColor: authPalette.danger
  },
  multilineShell: {
    alignItems: "flex-start",
    paddingVertical: 14
  },
  input: {
    flex: 1,
    color: authPalette.text,
    fontFamily: "Cairo_500Medium",
    fontSize: 16,
    textAlign: "right",
    writingDirection: "rtl",
    includeFontPadding: false,
    paddingVertical: 0
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top"
  },
  description: {
    color: authPalette.textSoft,
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    textAlign: "right"
  },
  error: {
    color: authPalette.danger,
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    textAlign: "right"
  }
});
