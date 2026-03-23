import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Linking } from "react-native";

import { appQueryKeys } from "@/app/di/query-keys";
import { ConsultationEntity } from "@/domain/entities/Consultation";
import { ConsultationCard, ConsultationCardAction } from "@/features/consultations/components/ConsultationCard";
import {
  useArchiveConsultationMutation,
  useMarkConsultationAsPaidMutation,
  useReopenConsultationMutation
} from "@/features/consultations/hooks/useConsultationMutations";
import { PatientStackParamList } from "@/navigation/types";
import { queryClient } from "@/shared/utils/query-client";
import { useUiStore } from "@/store/ui/ui.store";

export function ConsultationListItem({
  consultation
}: {
  consultation: ConsultationEntity;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<PatientStackParamList>>();
  const showToast = useUiStore((state) => state.showToast);
  const payMutation = useMarkConsultationAsPaidMutation(consultation.id);
  const reopenMutation = useReopenConsultationMutation(consultation.id);
  const archiveMutation = useArchiveConsultationMutation(consultation.id);

  const openDetails = () => {
    navigation.navigate("ConsultationDetails", { consultationId: consultation.id });
  };

  const openChat = () => {
    void queryClient.invalidateQueries({ queryKey: appQueryKeys.conversationsRoot() });
    navigation.navigate("PatientTabs", { screen: "MessagesTab" });
  };

  const handleOpenUrl = async (url?: string | null) => {
    if (!url) {
      showToast({
        title: "الرابط غير متاح",
        description: "لم يرفق الطبيب التقرير أو الملف المطلوب بعد."
      });
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      showToast({
        title: "تعذر فتح الرابط",
        description: "تحقق من تهيئة روابط الملفات في الباك اند أو جرّب لاحقًا."
      });
    }
  };

  const primaryAction = getPrimaryAction({
    consultation,
    openDetails,
    payNow: () =>
      payMutation.mutate(undefined, {
        onSuccess: () => {
          openChat();
        }
      }),
    reopen: () => reopenMutation.mutate(),
    paying: payMutation.isPending,
    reopening: reopenMutation.isPending
  });

  const secondaryAction = getSecondaryAction({
    consultation,
    openDetails,
    openChat,
    downloadReport: () => {
      void handleOpenUrl(consultation.reportUrl);
    },
    archive: () => archiveMutation.mutate(),
    archiving: archiveMutation.isPending
  });

  return (
    <ConsultationCard
      consultation={consultation}
      onPress={openDetails}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
    />
  );
}

function getPrimaryAction({
  consultation,
  openDetails,
  payNow,
  reopen,
  paying,
  reopening
}: {
  consultation: ConsultationEntity;
  openDetails: () => void;
  payNow: () => void;
  reopen: () => void;
  paying: boolean;
  reopening: boolean;
}): ConsultationCardAction {
  if (consultation.canPay) {
    return {
      label: "ادفع الآن",
      onPress: payNow,
      loading: paying,
      variant: "primary"
    };
  }

  if (consultation.canReopen) {
    return {
      label: "إعادة الاستشارة",
      onPress: reopen,
      loading: reopening,
      variant: "outline"
    };
  }

  if (consultation.status === "pending" || consultation.status === "accepted") {
    return {
      label: "متابعة الطلب",
      onPress: openDetails,
      variant: "secondary"
    };
  }

  return {
    label: "عرض التفاصيل",
    onPress: openDetails,
    variant: "primary"
  };
}

function getSecondaryAction({
  consultation,
  openDetails,
  openChat,
  downloadReport,
  archive,
  archiving
}: {
  consultation: ConsultationEntity;
  openDetails: () => void;
  openChat: () => void;
  downloadReport: () => void;
  archive: () => void;
  archiving: boolean;
}): ConsultationCardAction {
  if (consultation.canDownloadReport) {
    return {
      label: "التقرير",
      onPress: downloadReport,
      variant: "ghost"
    };
  }

  if (consultation.canArchive) {
    return {
      label: "أرشفة",
      onPress: archive,
      loading: archiving,
      variant: "ghost"
    };
  }

  if (consultation.unreadUpdatesCount > 0) {
    return {
      label: "تحديث الآن",
      onPress: openDetails,
      variant: "ghost"
    };
  }

  if (consultation.canOpenChat) {
    return {
      label: "فتح الشات",
      onPress: openChat,
      variant: "ghost"
    };
  }

  return {
    label: "آخر تحديث",
    onPress: openDetails,
    variant: "ghost"
  };
}
