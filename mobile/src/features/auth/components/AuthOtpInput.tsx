import { useMemo, useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { authPalette } from "@/features/auth/components/auth-theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
};

export function AuthOtpInput({ value, onChange, length = 4 }: Props) {
  const refs = useRef<Array<TextInput | null>>([]);
  const digits = useMemo(
    () =>
      Array.from({ length }, (_, index) => {
        const digit = value[index];
        return digit && /\d/.test(digit) ? digit : "";
      }),
    [length, value]
  );

  const updateValue = (nextDigits: string[]) => {
    onChange(nextDigits.join(""));
  };

  const focusAt = (index: number) => {
    refs.current[index]?.focus();
  };

  const handleChange = (text: string, index: number) => {
    const sanitized = text.replace(/\D/g, "");
    const nextDigits = [...digits];

    if (sanitized.length > 1) {
      sanitized
        .slice(0, length - index)
        .split("")
        .forEach((digit, offset) => {
          nextDigits[index + offset] = digit;
        });
      updateValue(nextDigits);
      focusAt(Math.min(index + sanitized.length, length - 1));
      return;
    }

    nextDigits[index] = sanitized;
    updateValue(nextDigits);

    if (sanitized && index < length - 1) {
      focusAt(index + 1);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key !== "Backspace") {
      return;
    }

    if (digits[index]) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      updateValue(nextDigits);
      return;
    }

    if (index > 0) {
      focusAt(index - 1);
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={`otp-${index}`}
          ref={(ref) => {
            refs.current[index] = ref;
          }}
          value={digit}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={index === 0 ? length : 1}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          style={styles.input}
          textAlign="center"
          selectionColor={authPalette.accent}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 10
  },
  input: {
    flex: 1,
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: authPalette.inputBorder,
    backgroundColor: authPalette.input,
    color: authPalette.text,
    fontFamily: "Cairo_700Bold",
    fontSize: 24
  }
});
