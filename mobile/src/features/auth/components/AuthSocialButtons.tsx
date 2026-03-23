import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { authPalette } from "@/features/auth/components/auth-theme";

type Props = {
  onGooglePress?: () => void;
  onApplePress?: () => void;
};

export function AuthSocialButtons({ onGooglePress, onApplePress }: Props) {
  return (
    <View style={styles.row}>
      <SocialButton label="جوجل" icon="logo-google" onPress={onGooglePress} />
      <SocialButton label="Apple" icon="logo-apple" onPress={onApplePress} />
    </View>
  );
}

function SocialButton({
  label,
  icon,
  onPress
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={16} color={authPalette.text} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    gap: 12
  },
  button: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: authPalette.border,
    backgroundColor: authPalette.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  buttonPressed: {
    opacity: 0.84
  },
  content: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    color: authPalette.text,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14
  }
});
