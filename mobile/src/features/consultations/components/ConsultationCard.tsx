import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { ConsultationEntity } from "@/domain/entities/Consultation";
import {
  ConsultationTone,
  consultationNotificationMap
} from "@/features/consultations/constants/consultation-status";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import { ConsultationAvatar } from "@/features/consultations/components/ConsultationAvatar";
import { ConsultationButton } from "@/features/consultations/components/ConsultationButton";
import { ConsultationStatusBadge } from "@/features/consultations/components/ConsultationStatusBadge";
import { ConsultationSurface } from "@/features/consultations/components/ConsultationSurface";
import { getPrimaryNotification } from "@/features/consultations/utils/consultation-helpers";
import {
  formatConsultationDate,
  formatConsultationDateTime
} from "@/features/consultations/utils/consultation-formatters";
import { entranceAnimation, listLayoutAnimation } from "@/shared/animations/presets";

export type ConsultationCardAction = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "outline";
};

export function ConsultationCard({
  consultation,
  onPress,
  primaryAction,
  secondaryAction
}: {
  consultation: ConsultationEntity;
  onPress?: () => void;
  primaryAction?: ConsultationCardAction;
  secondaryAction?: ConsultationCardAction;
}) {
  const palette = useConsultationTheme();
  const statusMeta = getConsultationCardStatusMeta(consultation);
  const activityText =
    consultation.lastMessagePreview?.trim() || `آخر تحديث ${formatConsultationDateTime(consultation.updatedAt)}`;
  const indicator = getConsultationCardIndicator(consultation, palette);

  return (
    <Animated.View entering={entranceAnimation} layout={listLayoutAnimation}>
      <Pressable onPress={onPress}>
        <ConsultationSurface style={[styles.card, { borderColor: palette.border }]}>
          <View style={styles.headerRow}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarShell}>
                <ConsultationAvatar name={consultation.doctorName} imageUrl={consultation.doctorAvatarUrl} size={72} />
              </View>
              {indicator ? (
                <View
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: indicator.backgroundColor,
                      borderColor: palette.pageAlt
                    }
                  ]}
                >
                  {indicator.icon ? (
                    <Ionicons name={indicator.icon} size={11} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.indicatorLabel}>{indicator.label}</Text>
                  )}
                </View>
              ) : null}
            </View>

            <View style={styles.copyBlock}>
              <Text numberOfLines={1} style={[styles.doctorName, { color: palette.text }]}>
                {consultation.doctorName}
              </Text>
              <Text numberOfLines={1} style={[styles.specialization, { color: palette.textMuted }]}>
                {consultation.specialization}
              </Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={14} color={palette.textMuted} />
                <Text style={[styles.dateText, { color: palette.textMuted }]}>
                  {formatConsultationDate(consultation.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <View style={styles.metaRow}>
            <PriceBlock value={consultation.price} />
            <ConsultationStatusBadge
              status={consultation.status}
              archived={Boolean(consultation.archivedAt)}
              variant="compact"
              labelOverride={statusMeta.label}
              toneOverride={statusMeta.tone}
            />
          </View>

          <View style={styles.updateRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={15} color={palette.textMuted} />
            <Text numberOfLines={1} style={[styles.updateText, { color: palette.textSoft }]}>
              {activityText}
            </Text>
          </View>

          {(primaryAction || secondaryAction) ? (
            <View style={styles.actionsRow}>
              {primaryAction ? (
                <ConsultationButton
                  title={primaryAction.label}
                  onPress={primaryAction.onPress}
                  loading={primaryAction.loading}
                  variant={primaryAction.variant ?? "primary"}
                  style={styles.primaryAction}
                />
              ) : null}
              {secondaryAction ? (
                <ConsultationButton
                  title={secondaryAction.label}
                  onPress={secondaryAction.onPress}
                  loading={secondaryAction.loading}
                  variant={secondaryAction.variant ?? "ghost"}
                  style={styles.secondaryAction}
                />
              ) : null}
            </View>
          ) : null}
        </ConsultationSurface>
      </Pressable>
    </Animated.View>
  );
}

function PriceBlock({ value }: { value?: number | null }) {
  const palette = useConsultationTheme();

  if (!value) {
    return (
      <View style={styles.priceBlock}>
        <Text style={[styles.priceFallback, { color: palette.textMuted }]}>السعر حسب الحالة</Text>
      </View>
    );
  }

  return (
    <View style={styles.priceBlock}>
      <View style={styles.priceRow}>
        <Text style={[styles.priceCurrency, { color: palette.textMuted }]}>ر.س</Text>
        <Text style={[styles.priceValue, { color: palette.primary }]}>{value}</Text>
      </View>
    </View>
  );
}

function getConsultationCardStatusMeta(consultation: ConsultationEntity): {
  label: string;
  tone: ConsultationTone;
} {
  if (consultation.requestType === "urgent" && consultation.status !== "completed" && consultation.status !== "rejected") {
    return { label: "عاجل جدًا", tone: "danger" };
  }

  if (consultation.status === "accepted") {
    return { label: "قيد المراجعة", tone: "accent" };
  }

  if (consultation.status === "active") {
    return { label: "جارية الآن", tone: "brand" };
  }

  if (consultation.status === "awaiting_payment") {
    return { label: "بانتظار الدفع", tone: "accent" };
  }

  if (consultation.status === "completed") {
    return { label: "مكتملة", tone: "neutral" };
  }

  if (consultation.status === "rejected") {
    return { label: "مرفوضة", tone: "danger" };
  }

  return { label: "قيد الانتظار", tone: "warning" };
}

function getConsultationCardIndicator(
  consultation: ConsultationEntity,
  palette: ReturnType<typeof useConsultationTheme>
): {
  backgroundColor: string;
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
} | null {
  const notification = getPrimaryNotification(consultation);

  if (notification?.isUnread) {
    const notificationTone = palette.tones[consultationNotificationMap[notification.type].tone];

    return {
      backgroundColor: notificationTone.solid,
      label:
        consultation.unreadUpdatesCount > 0
          ? String(Math.min(consultation.unreadUpdatesCount, 9))
          : notification.type === "payment_required"
            ? "!"
            : "•"
    };
  }

  if (consultation.status === "completed") {
    return {
      backgroundColor: palette.borderStrong,
      icon: "checkmark"
    };
  }

  return null;
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
    borderRadius: 28,
    padding: 18
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14
  },
  avatarWrapper: {
    position: "relative"
  },
  avatarShell: {
    width: 82,
    height: 82,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  indicator: {
    position: "absolute",
    top: -4,
    left: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2
  },
  indicatorLabel: {
    color: "#FFFFFF",
    fontFamily: "Cairo_700Bold",
    fontSize: 10
  },
  copyBlock: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  doctorName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    textAlign: "right"
  },
  specialization: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    textAlign: "right"
  },
  dateRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6
  },
  dateText: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12
  },
  divider: {
    height: 1,
    opacity: 0.7
  },
  metaRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  priceBlock: {
    minHeight: 36,
    justifyContent: "center"
  },
  priceRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    gap: 4
  },
  priceValue: {
    fontFamily: "Cairo_700Bold",
    fontSize: 30,
    lineHeight: 34
  },
  priceCurrency: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    marginBottom: 5
  },
  priceFallback: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13
  },
  updateRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8
  },
  updateText: {
    flex: 1,
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    textAlign: "right"
  },
  actionsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12
  },
  primaryAction: {
    flex: 1
  },
  secondaryAction: {
    minWidth: 112
  }
});
