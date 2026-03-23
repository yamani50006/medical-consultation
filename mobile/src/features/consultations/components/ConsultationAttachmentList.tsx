import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { ConsultationAttachmentEntity } from "@/domain/entities/Consultation";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import { formatShortDate } from "@/features/consultations/utils/consultation-formatters";

function resolveAttachmentIcon(type: ConsultationAttachmentEntity["type"]) {
  if (type === "image") {
    return "image-outline";
  }

  if (type === "pdf") {
    return "document-attach-outline";
  }

  return "folder-outline";
}

export function ConsultationAttachmentList({
  attachments,
  onOpen
}: {
  attachments: ConsultationAttachmentEntity[];
  onOpen?: (attachment: ConsultationAttachmentEntity) => void;
}) {
  const palette = useConsultationTheme();

  return (
    <View style={{ gap: 10 }}>
      {attachments.map((attachment) => (
        <Pressable
          key={attachment.id}
          onPress={() => onOpen?.(attachment)}
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            gap: 12,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: palette.border,
            backgroundColor: palette.surface,
            padding: 14
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.tones.accent.background
            }}
          >
            <Ionicons name={resolveAttachmentIcon(attachment.type)} size={20} color={palette.accent} />
          </View>
          <View style={{ flex: 1, alignItems: "flex-end", gap: 2 }}>
            <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 14 }}>{attachment.name}</Text>
            <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 12 }}>
              {attachment.sizeLabel ?? "ملف مرفق"} • {formatShortDate(attachment.uploadedAt)}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
