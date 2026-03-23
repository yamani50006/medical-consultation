import { Text, View } from "react-native";

import { ConsultationTimelineEventEntity } from "@/domain/entities/Consultation";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import { formatConsultationDateTime } from "@/features/consultations/utils/consultation-formatters";

export function ConsultationTimeline({
  events
}: {
  events: ConsultationTimelineEventEntity[];
}) {
  const palette = useConsultationTheme();

  return (
    <View style={{ gap: 16 }}>
      {events.map((event, index) => {
        const isDone = event.completed;

        return (
          <View key={`${event.id}-${index}`} style={{ flexDirection: "row-reverse", gap: 14 }}>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  backgroundColor: isDone ? palette.primary : palette.surfaceMuted,
                  borderWidth: 3,
                  borderColor: isDone ? `${palette.primary}33` : palette.borderStrong
                }}
              />
              {index < events.length - 1 ? (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    marginTop: 6,
                    backgroundColor: isDone ? `${palette.primary}44` : palette.border
                  }}
                />
              ) : null}
            </View>
            <View style={{ flex: 1, alignItems: "flex-end", paddingBottom: 10 }}>
              <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 15 }}>{event.title}</Text>
              <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 12 }}>
                {event.occurredAt ? formatConsultationDateTime(event.occurredAt) : "بانتظار التنفيذ"}
              </Text>
              {event.description ? (
                <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right", lineHeight: 21, marginTop: 4 }}>
                  {event.description}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
