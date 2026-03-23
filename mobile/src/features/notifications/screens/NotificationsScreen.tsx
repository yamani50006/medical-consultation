import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, RefreshControl, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";

import { NotificationEntity } from "@/domain/entities/Notification";
import { PatientHeader } from "@/features/home/components/PatientHeader";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { PatientPalette, usePatientPalette } from "@/features/home/components/patient-theme";
import { useNotificationsQuery } from "@/features/notifications";
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation
} from "@/features/notifications/hooks/useNotificationMutations";
import { PatientStackParamList } from "@/navigation/types";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Loader } from "@/shared/components/Loader";

type Props = NativeStackScreenProps<PatientStackParamList, "Notifications">;

export function NotificationsScreen({ navigation }: Props) {
  const query = useNotificationsQuery({ limit: 50 });
  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();
  const patientPalette = usePatientPalette();
  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const handleNotificationPress = async (notification: NotificationEntity) => {
    if (!notification.isRead) {
      await markAsReadMutation.mutateAsync(notification.id);
    }

    if (notification.entityType === "consultation" && notification.entityId) {
      navigation.navigate("ConsultationDetails", { consultationId: notification.entityId });
      return;
    }

    if (notification.type === "APPOINTMENT_BOOKED") {
      navigation.navigate("PatientTabs", { screen: "AppointmentsTab" });
      return;
    }

    if (notification.conversationId || notification.type === "CHAT_MESSAGE" || notification.type === "CONVERSATION_CREATED") {
      navigation.navigate("PatientTabs", { screen: "MessagesTab" });
      return;
    }
  };

  return (
    <PatientScreen>
      <PatientHeader
        title="التنبيهات"
        subtitle="آخر التحديثات والإشعارات"
        showNotificationButton={false}
        showBackButton
      />

      <PatientSurface style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ alignItems: "flex-end", gap: 2 }}>
          <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 18 }}>
            لديك {unreadCount} غير مقروءة
          </Text>
          <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 13 }}>
            افتح الإشعار للانتقال إلى الحالة المرتبطة به مباشرة.
          </Text>
        </View>

        <Pressable
          onPress={() => markAllAsReadMutation.mutate()}
          disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          style={{
            minHeight: 42,
            paddingHorizontal: 14,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: unreadCount === 0 ? patientPalette.panelSoft : `${patientPalette.primary}20`,
            borderWidth: 1,
            borderColor: unreadCount === 0 ? patientPalette.lineSoft : `${patientPalette.primary}45`,
            opacity: markAllAsReadMutation.isPending ? 0.6 : 1
          }}
        >
          <Text style={{ color: unreadCount === 0 ? patientPalette.textMuted : patientPalette.primary, fontFamily: "Cairo_700Bold", fontSize: 13 }}>
            تعليم الكل كمقروء
          </Text>
        </Pressable>
      </PatientSurface>

      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState message="تعذر تحميل التنبيهات" onRetry={query.refetch} /> : null}

      {!query.isLoading && !query.isError ? (
        <FlashList
          data={notifications}
          estimatedItemSize={106}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching && !query.isLoading}
              onRefresh={query.refetch}
              tintColor={patientPalette.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="لا توجد تنبيهات"
              description="ستظهر هنا القبولات الجديدة، الرسائل، وتحديثات الاستشارات."
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              patientPalette={patientPalette}
              disabled={markAsReadMutation.isPending && markAsReadMutation.variables === item.id}
              onPress={() => {
                void handleNotificationPress(item);
              }}
            />
          )}
        />
      ) : null}
    </PatientScreen>
  );
}

function NotificationCard({
  notification,
  onPress,
  disabled,
  patientPalette
}: {
  notification: NotificationEntity;
  onPress: () => void;
  disabled?: boolean;
  patientPalette: PatientPalette;
}) {
  const tone = getNotificationTone(notification.type, patientPalette);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <PatientSurface
        style={{
          borderColor: notification.isRead ? patientPalette.glassBorder : `${tone.color}45`,
          backgroundColor: notification.isRead ? undefined : `${tone.color}0D`
        }}
      >
        <View style={{ flexDirection: "row-reverse", alignItems: "flex-start", gap: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${tone.color}18`,
              borderWidth: 1,
              borderColor: `${tone.color}2E`
            }}
          >
            <Ionicons name={tone.icon} size={20} color={tone.color} />
          </View>

          <View style={{ flex: 1, alignItems: "flex-end", gap: 6 }}>
            <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", width: "100%", alignItems: "center", gap: 12 }}>
              <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 15, flex: 1, textAlign: "right" }}>
                {notification.title}
              </Text>
              {!notification.isRead ? (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 10,
                    backgroundColor: patientPalette.primary
                  }}
                />
              ) : null}
            </View>

            <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", lineHeight: 22, textAlign: "right" }}>
              {notification.message}
            </Text>

            <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <Text style={{ color: tone.color, fontFamily: "Cairo_700Bold", fontSize: 12 }}>
                {tone.label}
              </Text>
              <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 12 }}>
                {formatNotificationTime(notification.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </PatientSurface>
    </Pressable>
  );
}

function getNotificationTone(type: string, patientPalette: PatientPalette) {
  if (type === "CHAT_MESSAGE" || type === "CONVERSATION_CREATED") {
    return {
      label: "رسالة",
      color: patientPalette.primary,
      icon: "chatbubble-ellipses-outline" as const
    };
  }

  if (type === "CONSULTATION_ACCEPTED") {
    return {
      label: "استشارة",
      color: patientPalette.green,
      icon: "checkmark-circle-outline" as const
    };
  }

  if (type === "APPOINTMENT_BOOKED") {
    return {
      label: "موعد",
      color: patientPalette.accent,
      icon: "calendar-outline" as const
    };
  }

  return {
    label: "تنبيه",
    color: patientPalette.textMuted,
    icon: "notifications-outline" as const
  };
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const diffMinutes = Math.round((Date.now() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 1) {
    return "الآن";
  }

  if (diffMinutes < 60) {
    return `منذ ${diffMinutes} دقيقة`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `منذ ${diffHours} ساعة`;
  }

  return new Intl.DateTimeFormat("ar", {
    day: "numeric",
    month: "short"
  }).format(date);
}
