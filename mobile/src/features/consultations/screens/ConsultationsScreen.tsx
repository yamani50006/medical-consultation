import { FlashList } from "@shopify/flash-list";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RefreshControl, StyleSheet, Text, View } from "react-native";

import { PatientStackParamList } from "@/navigation/types";
import { ConsultationErrorState } from "@/features/consultations/components/ConsultationErrorState";
import { ConsultationFilterTabs } from "@/features/consultations/components/ConsultationFilterTabs";
import { ConsultationHeader } from "@/features/consultations/components/ConsultationHeader";
import { ConsultationListItem } from "@/features/consultations/components/ConsultationListItem";
import { ConsultationLoader } from "@/features/consultations/components/ConsultationLoader";
import { ConsultationScreenLayout } from "@/features/consultations/components/ConsultationScreenLayout";
import { ConsultationSummaryTabs } from "@/features/consultations/components/ConsultationSummaryTabs";
import { EmptyConsultationsState } from "@/features/consultations/components/EmptyConsultationsState";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import { useConsultations } from "@/features/consultations/hooks/useConsultations";

type Props = NativeStackScreenProps<PatientStackParamList, "MyConsultations">;

export function ConsultationsScreen({ navigation }: Props) {
  const palette = useConsultationTheme();
  const consultations = useConsultations({ limit: 50 });

  const summaryItems = [
    {
      id: "pending",
      label: "قيد الانتظار",
      value: consultations.statusCounts.pending,
      active: consultations.selectedStatus === "pending",
      onPress: () => {
        consultations.setActiveFilter("active");
        consultations.setSelectedStatus("pending");
      }
    },
    {
      id: "active",
      label: "نشطة",
      value: consultations.filterCounts.active,
      active: consultations.activeFilter === "active" && consultations.selectedStatus === "all",
      onPress: () => {
        consultations.setActiveFilter("active");
      }
    },
    {
      id: "all",
      label: "الكل",
      value: consultations.filterCounts.all,
      active: consultations.activeFilter === "all" && consultations.selectedStatus === "all",
      onPress: () => {
        consultations.setActiveFilter("all");
      }
    }
  ];

  const filterItems = [
    { id: "all", label: "الكل" },
    { id: "active", label: "نشطة" },
    { id: "pending", label: "قيد الانتظار" },
    { id: "completed", label: "مكتملة" },
    { id: "rejected", label: "مرفوضة" },
    { id: "archived", label: "المؤرشفة" }
  ];

  const activeFilterId =
    consultations.selectedStatus === "pending" ? "pending" : consultations.activeFilter;

  const handleFilterChange = (id: string) => {
    if (id === "pending") {
      consultations.setActiveFilter("active");
      consultations.setSelectedStatus("pending");
      return;
    }

    consultations.setActiveFilter(id as typeof consultations.activeFilter);
  };

  return (
    <ConsultationScreenLayout scrollable={false} contentContainerStyle={{ flex: 1 }}>
      {consultations.isLoading ? <ConsultationLoader /> : null}
      {consultations.isError ? (
        <ConsultationErrorState message="تعذر تحميل الاستشارات حاليًا" onRetry={consultations.refetch} />
      ) : null}

      {!consultations.isLoading && !consultations.isError ? (
        <FlashList
          data={consultations.filteredConsultations}
          keyExtractor={(item) => item.id}
          estimatedItemSize={270}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={consultations.isRefreshing}
              onRefresh={consultations.refetch}
              tintColor={palette.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <ConsultationHeader title="استشاراتي" subtitle="تابع جميع الاستشارات الطبية من واجهة واضحة ومنظمة" />

              <ConsultationSummaryTabs items={summaryItems} />

              <ConsultationFilterTabs
                items={filterItems}
                activeId={activeFilterId}
                variant="secondary"
                onChange={handleFilterChange}
              />

              {consultations.alerts.length > 0 ? (
                <View style={[styles.alertStrip, { backgroundColor: palette.surfaceStrong, borderColor: palette.border }]}>
                  <View style={[styles.alertDot, { backgroundColor: palette.primary }]} />
                  <Text style={[styles.alertText, { color: palette.textMuted }]}>
                    لديك {consultations.alerts.length} تنبيهات جديدة داخل بعض الاستشارات.
                  </Text>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <EmptyConsultationsState
              activeFilter={consultations.activeFilter}
              onCreate={() => navigation.navigate("ConsultationRequest")}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          renderItem={({ item }) => <ConsultationListItem consultation={item} />}
        />
      ) : null}
    </ConsultationScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1
  },
  listHeader: {
    gap: 16,
    paddingBottom: 16
  },
  alertStrip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 999
  },
  alertText: {
    flex: 1,
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    textAlign: "right"
  },
  listContent: {
    paddingBottom: 26
  }
});
