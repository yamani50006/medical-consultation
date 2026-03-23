import { useMemo, useState } from "react";
import { Image, Text, View } from "react-native";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function Avatar({
  name,
  imageUrl,
  size = 52,
  backgroundColor,
  textColor
}: {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}) {
  const { theme } = useAppTheme();
  const [failed, setFailed] = useState(false);
  const safeName = (name ?? "").trim() || "مستخدم";
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
        backgroundColor: backgroundColor ?? theme.colors.brand.soft
      }}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl ?? undefined }}
          onError={() => setFailed(true)}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={{ color: textColor ?? theme.colors.brand.primary, fontFamily: "Cairo_700Bold", fontSize: size / 3 }}>{initials}</Text>
      )}
    </View>
  );
}
