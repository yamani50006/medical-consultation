import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { DoctorEntity } from "@/domain/entities/Doctor";
import { entranceAnimation } from "@/shared/animations/presets";
import { Avatar } from "@/shared/components/Avatar";
import { Card } from "@/shared/components/Card";
import { PriceTag } from "@/shared/components/PriceTag";
import { RatingStars } from "@/shared/components/RatingStars";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function DoctorCard({ doctor, onPress }: { doctor: DoctorEntity; onPress?: () => void }) {
  const { theme } = useAppTheme();

  return (
    <Animated.View entering={entranceAnimation}>
      <Pressable onPress={onPress}>
        <Card>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.colors.text.primary }]}>{doctor.fullName}</Text>
              <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>{doctor.specialization}</Text>
              <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>
                {doctor.city ?? "عن بُعد"} {doctor.region ? `• ${doctor.region}` : ""}
              </Text>
            </View>
            <Avatar name={doctor.fullName} />
          </View>
          <View style={styles.row}>
            <PriceTag value={doctor.consultationFee} />
            <StatusBadge active={doctor.isAvailableNow} />
          </View>
          <View style={styles.row}>
            <RatingStars rating={doctor.rating} count={doctor.reviewsCount} />
            <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>
              {doctor.yearsOfExperience} سنة خبرة
            </Text>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: 12 },
  info: { flex: 1, gap: 4, alignItems: "flex-end" },
  name: { fontFamily: "Cairo_700Bold", fontSize: 18 },
  meta: { fontFamily: "Cairo_500Medium", fontSize: 13 }
});

