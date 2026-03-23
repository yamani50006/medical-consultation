import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ReactNode, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import {
  DOCTOR_MODE_OPTIONS,
  useSmartDoctorSearch
} from "@/features/doctors/hooks/useSmartDoctorSearch";
import { DoctorSmartSearchResultCard } from "@/features/doctors/components/DoctorSmartSearchResultCard";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSearchBar } from "@/features/home/components/PatientSearchBar";
import { PatientPalette, usePatientPalette } from "@/features/home/components/patient-theme";
import { entranceAnimation, exitAnimation, listLayoutAnimation } from "@/shared/animations/presets";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Loader } from "@/shared/components/Loader";

export function DoctorsListScreen() {
  const navigation = useNavigation<any>();
  const patientPalette = usePatientPalette();
  const styles = useMemo(() => createStyles(patientPalette), [patientPalette]);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const {
    search,
    setSearch,
    selectedSpecialization,
    setSelectedSpecialization,
    selectedMode,
    setSelectedMode,
    availableNowOnly,
    setAvailableNowOnly,
    selectedPricePresetId,
    setSelectedPricePresetId,
    selectedMinimumRating,
    setSelectedMinimumRating,
    locationPreference,
    setLocationPreference,
    pricePresets,
    ratingOptions,
    locationOptions,
    activeFiltersCount,
    effectiveSummary,
    specializationChips,
    selectedPricePreset,
    clearFilters,
    doctorsQuery,
    filtersQuery
  } = useSmartDoctorSearch();

  const doctors = doctorsQuery.data ?? [];
  const priceProgress = buildPriceProgress(selectedPricePreset, filtersQuery.data?.priceRange.max);

  return (
    <PatientScreen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>النتائج الذكية</Text>
        <Text style={styles.title}>ابحث عن الطبيب أو التخصص</Text>
        <Text style={styles.subtitle}>النتائج ترتب حسب التخصص، المدينة، التقييم، والتوافق مع حالة المريض.</Text>
      </View>

      <PatientSearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="ابحث عن الطبيب أو التخصص"
        onFilterPress={() => setFiltersVisible((current) => !current)}
        filterActive={filtersVisible || activeFiltersCount > 0}
        filterCount={activeFiltersCount}
      />

      <View style={styles.summaryWrap}>
        {effectiveSummary.slice(0, 4).map((item) => (
          <View key={item} style={styles.summaryChip}>
            <Text style={styles.summaryChipText}>{item}</Text>
          </View>
        ))}
      </View>

      {filtersVisible ? (
        <Animated.View entering={entranceAnimation} exiting={exitAnimation} layout={listLayoutAnimation}>
          <View style={styles.filtersPanel}>
            <View style={styles.filtersHeader}>
              <Pressable onPress={clearFilters} hitSlop={8}>
                <Text style={styles.resetText}>إعادة الضبط</Text>
              </Pressable>
              <Text style={styles.filtersTitle}>الفلاتر الذكية</Text>
            </View>

            <FilterSectionCard title="التصنيفات" actionLabel="عرض الكل" styles={styles}>
              {filtersQuery.isLoading && specializationChips.length === 0 ? (
                <Text style={styles.helperText}>جاري تجهيز التخصصات...</Text>
              ) : (
                <View style={styles.sectionContent}>
                  <View style={styles.chipWrap}>
                    {specializationChips.map((item) => (
                      <FilterChip
                        key={item}
                        label={item}
                        active={selectedSpecialization === item}
                        styles={styles}
                        onPress={() => setSelectedSpecialization(selectedSpecialization === item ? null : item)}
                      />
                    ))}
                  </View>

                  <View style={styles.modeWrap}>
                    {DOCTOR_MODE_OPTIONS.map((option) => (
                      <FilterChip
                        key={option.value}
                        label={option.label}
                        active={selectedMode === option.value}
                        styles={styles}
                        onPress={() => setSelectedMode(selectedMode === option.value ? "any" : option.value)}
                      />
                    ))}
                    <FilterChip
                      label="متاح الآن"
                      active={availableNowOnly}
                      styles={styles}
                      onPress={() => setAvailableNowOnly(!availableNowOnly)}
                    />
                  </View>
                </View>
              )}
            </FilterSectionCard>

            <FilterSectionCard title="فلتر السعر" styles={styles}>
              <View style={styles.sectionContent}>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceBadgeText}>{selectedPricePreset.label}</Text>
                </View>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { left: `${priceProgress.start}%`, width: `${priceProgress.width}%` }]} />
                  <View style={[styles.sliderHandle, { left: `${Math.max(priceProgress.start - 2, 0)}%` }]} />
                  <View style={[styles.sliderHandle, { left: `${Math.max(priceProgress.end - 2, 0)}%` }]} />
                </View>
                <View style={styles.sliderScale}>
                  <Text style={styles.scaleLabel}>مرتفع</Text>
                  <Text style={styles.scaleLabel}>منخفض</Text>
                </View>
                <View style={styles.chipWrap}>
                  {pricePresets.map((preset) => (
                    <FilterChip
                      key={preset.id}
                      label={preset.label}
                      active={selectedPricePresetId === preset.id}
                      styles={styles}
                      onPress={() => setSelectedPricePresetId(preset.id)}
                    />
                  ))}
                </View>
              </View>
            </FilterSectionCard>

            <FilterSectionCard title="المسافة (الأقرب)" styles={styles}>
              <View style={styles.chipWrap}>
                {locationOptions.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    active={locationPreference === option.value}
                    styles={styles}
                    onPress={() => setLocationPreference(option.value)}
                  />
                ))}
              </View>
            </FilterSectionCard>

            <FilterSectionCard title="التقييم" styles={styles}>
              <View style={styles.chipWrap}>
                {ratingOptions.map((option) => (
                  <FilterChip
                    key={option.label}
                    label={option.label}
                    active={selectedMinimumRating === option.value || (option.value === null && selectedMinimumRating === null)}
                    styles={styles}
                    onPress={() => setSelectedMinimumRating(option.value)}
                  />
                ))}
              </View>
            </FilterSectionCard>
          </View>
        </Animated.View>
      ) : null}

      <View style={styles.resultsHeader}>
        <View style={styles.resultsTitleWrap}>
          <Ionicons name="sparkles" size={14} color={patientPalette.primary} />
          <Text style={styles.resultsTitle}>نتائج المطابقة الذكية</Text>
        </View>
        <Text style={styles.resultsMeta}>
          {doctorsQuery.isLoading ? "جاري التحليل..." : `${doctors.length} طبيب`}
        </Text>
      </View>

      {doctorsQuery.isLoading ? <Loader /> : null}
      {doctorsQuery.isError ? <ErrorState message="تعذر تحميل الأطباء" onRetry={doctorsQuery.refetch} /> : null}
      {!doctorsQuery.isLoading && doctors.length === 0 ? (
        <EmptyState
          title="لا توجد نتائج مطابقة"
          description="جرّب فتح الفلاتر وتخفيف بعض القيود أو عدّل عبارة البحث للوصول إلى نتائج أكثر."
        />
      ) : null}

      <View style={styles.resultsList}>
        {doctors.map((doctor) => (
          <DoctorSmartSearchResultCard
            key={doctor.id}
            doctor={doctor}
            onProfilePress={() => navigation.navigate("DoctorDetails", { doctorId: doctor.id })}
            onBookPress={() =>
              navigation.navigate("Booking", {
                doctorId: doctor.id,
                doctorName: doctor.fullName
              })
            }
          />
        ))}
      </View>
    </PatientScreen>
  );
}

function FilterSectionCard({
  title,
  actionLabel,
  children,
  styles
}: {
  title: string;
  actionLabel?: string;
  children: ReactNode;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        {actionLabel ? <Text style={styles.sectionAction}>{actionLabel}</Text> : <View />}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  styles
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.filterChip, active ? styles.filterChipActive : null]}>
      <Text style={[styles.filterChipText, active ? styles.filterChipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function buildPriceProgress(
  preset: { minPrice?: number; maxPrice?: number },
  premiumFloor?: number
) {
  const referenceMax = Math.max(preset.maxPrice ?? premiumFloor ?? 1000, premiumFloor ?? 1000, 1000);
  const start = ((preset.minPrice ?? 0) / referenceMax) * 100;
  const end = (((preset.maxPrice ?? premiumFloor ?? referenceMax) || referenceMax) / referenceMax) * 100;

  return {
    start: Math.max(0, Math.min(92, start)),
    end: Math.max(8, Math.min(96, end)),
    width: Math.max(8, end - start)
  };
}

function createStyles(patientPalette: PatientPalette) {
  return StyleSheet.create({
    hero: {
      alignItems: "flex-end",
      gap: 4
    },
    eyebrow: {
      color: patientPalette.primary,
      fontFamily: "Cairo_700Bold",
      fontSize: 12
    },
    title: {
      color: patientPalette.text,
      fontFamily: "Cairo_700Bold",
      fontSize: 24,
      textAlign: "right"
    },
    subtitle: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_500Medium",
      fontSize: 13,
      lineHeight: 22,
      textAlign: "right"
    },
    summaryWrap: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8
    },
    summaryChip: {
      borderRadius: 999,
      backgroundColor: `${patientPalette.primary}14`,
      borderWidth: 1,
      borderColor: `${patientPalette.primary}22`,
      paddingHorizontal: 10,
      paddingVertical: 6
    },
    summaryChipText: {
      color: patientPalette.primary,
      fontFamily: "Cairo_700Bold",
      fontSize: 11
    },
    filtersPanel: {
      borderRadius: 28,
      borderWidth: 1,
      borderColor: patientPalette.glassBorder,
      backgroundColor: patientPalette.glass,
      padding: 14,
      gap: 14,
      shadowColor: patientPalette.shadow,
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.22,
      shadowRadius: 22,
      elevation: 10
    },
    filtersHeader: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between"
    },
    filtersTitle: {
      color: patientPalette.text,
      fontFamily: "Cairo_700Bold",
      fontSize: 17
    },
    resetText: {
      color: patientPalette.primary,
      fontFamily: "Cairo_700Bold",
      fontSize: 12
    },
    sectionCard: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: patientPalette.lineSoft,
      backgroundColor: patientPalette.panel,
      padding: 14,
      gap: 12
    },
    sectionHeader: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between"
    },
    sectionTitle: {
      color: patientPalette.text,
      fontFamily: "Cairo_700Bold",
      fontSize: 15
    },
    sectionAction: {
      color: patientPalette.primary,
      fontFamily: "Cairo_700Bold",
      fontSize: 12
    },
    sectionContent: {
      gap: 12
    },
    helperText: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_500Medium",
      fontSize: 13,
      lineHeight: 22,
      textAlign: "right"
    },
    chipWrap: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8
    },
    modeWrap: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8
    },
    filterChip: {
      minHeight: 38,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: patientPalette.lineSoft,
      backgroundColor: patientPalette.panelSoft,
      paddingHorizontal: 14,
      alignItems: "center",
      justifyContent: "center"
    },
    filterChipActive: {
      backgroundColor: "#7AF2E7",
      borderColor: "#7AF2E7"
    },
    filterChipText: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_700Bold",
      fontSize: 12
    },
    filterChipTextActive: {
      color: "#07333B"
    },
    priceBadge: {
      alignSelf: "flex-end",
      borderRadius: 999,
      backgroundColor: `${patientPalette.primary}12`,
      borderWidth: 1,
      borderColor: `${patientPalette.primary}22`,
      paddingHorizontal: 10,
      paddingVertical: 5
    },
    priceBadgeText: {
      color: patientPalette.primary,
      fontFamily: "Cairo_700Bold",
      fontSize: 11
    },
    sliderTrack: {
      height: 6,
      borderRadius: 999,
      backgroundColor: patientPalette.lineSoft,
      position: "relative"
    },
    sliderFill: {
      position: "absolute",
      top: 0,
      bottom: 0,
      borderRadius: 999,
      backgroundColor: "#7AF2E7"
    },
    sliderHandle: {
      position: "absolute",
      top: -4,
      width: 14,
      height: 14,
      borderRadius: 999,
      backgroundColor: "#FFFFFF",
      borderWidth: 3,
      borderColor: "#7AF2E7"
    },
    sliderScale: {
      flexDirection: "row-reverse",
      justifyContent: "space-between"
    },
    scaleLabel: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_600SemiBold",
      fontSize: 11
    },
    resultsHeader: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between"
    },
    resultsTitleWrap: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6
    },
    resultsTitle: {
      color: patientPalette.text,
      fontFamily: "Cairo_700Bold",
      fontSize: 16
    },
    resultsMeta: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_700Bold",
      fontSize: 12
    },
    resultsList: {
      gap: 14
    }
  });
}
