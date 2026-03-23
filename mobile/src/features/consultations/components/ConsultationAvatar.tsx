import { useMemo, useState } from "react";
import { Image, Text, View } from "react-native";

import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

export function ConsultationAvatar({
  name,
  imageUrl,
  size = 52
}: {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
}) {
  const palette = useConsultationTheme();
  const [failed, setFailed] = useState(false);
  const safeName = (name ?? "").trim() || "طبيب";
  const initials = useMemo(
    () =>
      safeName
        .split(" ")
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join(""),
    [safeName]
  );
  const showImage = Boolean(imageUrl && !failed);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.tones.brand.background,
        borderWidth: 1,
        borderColor: palette.tones.brand.border
      }}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl ?? undefined }}
          onError={() => setFailed(true)}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text
          style={{
            color: palette.primary,
            fontFamily: "Cairo_700Bold",
            fontSize: size / 3
          }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}
