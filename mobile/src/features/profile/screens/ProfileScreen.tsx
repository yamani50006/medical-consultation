import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { ReactNode, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProfileOverview } from "@/features/profile/hooks/useProfileOverview";
import { Avatar } from "@/shared/components/Avatar";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Loader } from "@/shared/components/Loader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { AppTheme } from "@/theme";
import { useAppStore } from "@/store/app/app.store";
import { sessionManager } from "@/store/auth/session.manager";
import { useUiStore } from "@/store/ui/ui.store";

export function ProfileScreen() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    medicalRecord: true
  });
  const [settingsSectionY, setSettingsSectionY] = useState(0);

  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation<any>();
  const overview = useProfileOverview();
  const showToast = useUiStore((state) => state.showToast);
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const { theme, mode, scheme, setMode } = useAppTheme();

  const isDarkMode = mode === "dark" || (mode === "system" && scheme === "dark");
  const palette = createProfilePalette(theme, isDarkMode);
  const profile = overview.profile;
  const displayName = overview.currentUser?.fullName || profile?.user.fullName || "المريض";
  const displayProfileImageUrl = overview.currentUser?.profileImageUrl ?? profile?.user.profileImageUrl ?? null;
  const displayEmail = overview.currentUser?.email || profile?.user.email || "";

  const openStackScreen = (screen: "Notifications" | "MyConsultations") => {
    const parentNavigation = navigation.getParent();

    if (parentNavigation) {
      parentNavigation.navigate(screen);
      return;
    }

    navigation.navigate(screen);
  };

  const medicalRows = [
    {
      key: "medicalRecord",
      title: "السجل الطبي",
      subtitle: buildMedicalRecordSummary(profile?.city, profile?.region, profile?.gender),
      details: [
        `المدينة: ${profile?.city || "غير محددة"}`,
        `المنطقة: ${profile?.region || "غير محددة"}`,
        `الجنس: ${formatGender(profile?.gender)}`,
        `الميلاد: ${formatBirthDate(profile?.dateOfBirth)}`
      ],
      icon: "document-text-outline" as const
    },
    {
      key: "medicalChecks",
      title: "الفحوصات",
      subtitle: buildMedicalChecksSummary(profile?.bloodType, overview.age),
      details: [
        `فصيلة الدم: ${profile?.bloodType || "غير مسجلة"}`,
        `العمر: ${overview.age ? `${overview.age} سنة` : "غير معروف"}`,
        `المواعيد المكتملة: ${overview.completedAppointmentsCount}`
      ],
      icon: "flask-outline" as const
    },
    {
      key: "medications",
      title: "الأدوية",
      subtitle: buildMedicationSummary(profile?.currentMedications),
      details: [
        `الأدوية الحالية: ${profile?.currentMedications || "لا توجد أدوية مسجلة"}`,
        `الأمراض المزمنة: ${profile?.chronicDiseases || "لا توجد أمراض مزمنة مسجلة"}`
      ],
      icon: "medical-outline" as const
    }
  ];

  const stats = [
    {
      key: "appointments",
      title: "القادمة",
      value: `${overview.upcomingAppointmentsCount}`,
      unit: "موعد",
      onPress: () => navigation.navigate("AppointmentsTab")
    },
    {
      key: "consultations",
      title: "الاستشارات",
      value: `${overview.activeConsultationsCount}`,
      unit: "نشطة",
      onPress: () => openStackScreen("MyConsultations")
    },
    {
      key: "notifications",
      title: "التنبيهات",
      value: `${overview.unreadNotificationsCount}`,
      unit: "غير مقروء",
      onPress: () => openStackScreen("Notifications")
    }
  ];

  const handleAccordionToggle = (key: string) => {
    setExpandedRows((current) => ({
      ...current,
      [key]: !current[key]
    }));
  };

  const handleSettingsLayout = (event: LayoutChangeEvent) => {
    setSettingsSectionY(event.nativeEvent.layout.y);
  };

  const handleGoToSettings = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(settingsSectionY - 20, 0),
      animated: true
    });
  };

  const handleLanguageToggle = () => {
    const nextLanguage = language === "ar" ? "en" : "ar";

    setLanguage(nextLanguage);
    showToast({
      title: nextLanguage === "en" ? "Language set to English" : "تم اعتماد العربية",
      description:
        nextLanguage === "en"
          ? "سيتم تطبيق اللغة في الشاشات المترجمة داخل التطبيق."
          : "ستظهر العربية في الشاشات الداعمة للترجمة."
    });
  };

  const handleThemeToggle = (enabled: boolean) => {
    setMode(enabled ? "dark" : "light");
    showToast({
      title: enabled ? "تم تفعيل الوضع الداكن" : "تم تفعيل الوضع الفاتح",
      description: "سيتم حفظ التفضيل على هذا الجهاز."
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.page }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={overview.isRefreshing}
            onRefresh={overview.refreshAll}
            tintColor={palette.primary}
            colors={[palette.primary, palette.accent]}
            progressBackgroundColor={palette.panel}
          />
        }
      >
        <LinearGradient colors={palette.backgroundGradient} style={StyleSheet.absoluteFillObject} />
        <LinearGradient colors={[palette.glowPrimary, "transparent"]} style={styles.glowPrimary} />
        <LinearGradient colors={[palette.glowAccent, "transparent"]} style={styles.glowAccent} />
        <View style={[styles.grid, { borderColor: palette.grid }]} />

        <View style={styles.topBar}>
          <ProfileIconButton icon="settings-outline" onPress={handleGoToSettings} palette={palette} />
          <Text style={[styles.screenTitle, { color: palette.text }]}>الملف الشخصي</Text>
          <ProfileIconButton
            icon="arrow-forward"
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
                return;
              }

              navigation.navigate("HomeTab");
            }}
            palette={palette}
          />
        </View>

        {overview.isLoading ? <Loader /> : null}
        {overview.isError ? <ErrorState message="تعذر تحميل ملفك الشخصي" onRetry={overview.refetchProfile} /> : null}
        {!overview.isLoading && !overview.isError && !profile ? (
          <EmptyState title="الملف غير متاح" description="لم نتمكن من جلب بيانات الحساب في الوقت الحالي." />
        ) : null}

        {profile ? (
          <>
            <View style={[styles.heroCard, { backgroundColor: palette.panel, borderColor: palette.line, shadowColor: palette.shadow }]}>
              <View style={[styles.avatarRing, { borderColor: palette.primary, shadowColor: palette.shadow }]}>
                <Avatar
                  name={displayName}
                  imageUrl={displayProfileImageUrl}
                  size={96}
                  backgroundColor={isDarkMode ? "#FFD0BE" : "#F8D7C7"}
                  textColor={isDarkMode ? "#88554A" : "#855247"}
                />
                <View style={[styles.avatarBadge, { backgroundColor: palette.primary }]}>
                  <Ionicons name="checkmark" size={14} color={isDarkMode ? "#08131D" : "#FFFFFF"} />
                </View>
              </View>

              <Text style={[styles.name, { color: palette.text }]}>{displayName}</Text>
              <View style={[styles.statusPill, { backgroundColor: palette.primarySoft, borderColor: palette.line }]}>
                <Ionicons name="shield-checkmark-outline" size={13} color={palette.primary} />
                <Text style={[styles.statusPillText, { color: palette.primary }]}>
                  {formatUserStatus(profile.user.status)} • اكتمال {overview.profileCompletion}%
                </Text>
              </View>
              <Text style={[styles.email, { color: palette.textMuted }]}>{displayEmail}</Text>

              <View style={[styles.progressTrack, { backgroundColor: palette.panelSoft, borderColor: palette.line }]}>
                <View style={[styles.progressFill, { width: `${Math.max(10, overview.profileCompletion)}%`, backgroundColor: palette.primary }]} />
              </View>

              <Pressable
                onPress={() => navigation.navigate("EditPatientProfile")}
                style={[styles.editProfileButton, { backgroundColor: palette.primarySoft, borderColor: palette.primary }]}
              >
                <Ionicons name="create-outline" size={16} color={palette.primary} />
                <Text style={[styles.editProfileButtonText, { color: palette.primary }]}>تعديل الاسم والصورة والبيانات</Text>
              </Pressable>
            </View>

            <View style={styles.metricsRow}>
              {stats.map((item) => (
                <ProfileMetricCard
                  key={item.key}
                  title={item.title}
                  value={item.value}
                  unit={item.unit}
                  onPress={item.onPress}
                  palette={palette}
                />
              ))}
            </View>

            {overview.nextAppointment ? (
              <Pressable
                onPress={() => navigation.navigate("AppointmentsTab")}
                style={[styles.nextAppointmentCard, { backgroundColor: palette.panel, borderColor: palette.line }]}
              >
                <View style={[styles.nextAppointmentIcon, { backgroundColor: palette.panelSoft, borderColor: palette.line }]}>
                  <Ionicons name="calendar-outline" size={18} color={palette.primary} />
                </View>
                <View style={styles.nextAppointmentCopy}>
                  <Text style={[styles.nextAppointmentLabel, { color: palette.textMuted }]}>الموعد القادم</Text>
                  <Text style={[styles.nextAppointmentTitle, { color: palette.text }]}>
                    {overview.nextAppointment.doctorName || "الطبيب المعالج"}
                  </Text>
                  <Text style={[styles.nextAppointmentMeta, { color: palette.textMuted }]}>
                    {formatAppointmentDate(overview.nextAppointment.appointmentDate)}
                  </Text>
                </View>
              </Pressable>
            ) : null}

            <SectionLabel title="البيانات الطبية" palette={palette} />
            <ProfileGroup palette={palette}>
              {medicalRows.map((item, index) => (
                <View key={item.key}>
                  {index > 0 ? <View style={[styles.divider, { backgroundColor: palette.divider }]} /> : null}
                  <ProfileRow
                    title={item.title}
                    subtitle={item.subtitle}
                    icon={item.icon}
                    details={item.details}
                    expanded={Boolean(expandedRows[item.key])}
                    onPress={() => handleAccordionToggle(item.key)}
                    palette={palette}
                  />
                </View>
              ))}
            </ProfileGroup>

            <View onLayout={handleSettingsLayout}>
              <SectionLabel title="الإعدادات" palette={palette} />
            </View>
            <ProfileGroup palette={palette}>
              <ProfileRow
                title="اللغة"
                subtitle="تبديل اللغة المفضلة في التطبيق"
                icon="language-outline"
                onPress={handleLanguageToggle}
                palette={palette}
                trailing={
                  <View style={styles.trailingMeta}>
                    <Text style={[styles.trailingValue, { color: palette.primary }]}>{language === "ar" ? "العربية" : "English"}</Text>
                    <Ionicons name="chevron-back" size={18} color={palette.textMuted} />
                  </View>
                }
              />
              <View style={[styles.divider, { backgroundColor: palette.divider }]} />
              <ProfileSwitchRow
                title="الوضع الداكن"
                subtitle="تطبيق نمط العرض الداكن على الشاشة"
                icon="moon-outline"
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                palette={palette}
              />
              <View style={[styles.divider, { backgroundColor: palette.divider }]} />
              <ProfileRow
                title="التنبيهات"
                subtitle={
                  overview.unreadNotificationsCount > 0
                    ? `لديك ${overview.unreadNotificationsCount} تنبيه غير مقروء`
                    : "لا توجد تنبيهات جديدة حالياً"
                }
                icon="notifications-outline"
                onPress={() => openStackScreen("Notifications")}
                palette={palette}
              />
            </ProfileGroup>

            <SectionLabel title="الدعم والقانون" palette={palette} />
            <ProfileGroup palette={palette}>
              <ProfileRow
                title="المساعدة"
                subtitle="ارشادات الاستخدام والمتابعة الطبية"
                icon="help-circle-outline"
                onPress={() => openStackScreen("MyConsultations")}
                palette={palette}
              />
              <View style={[styles.divider, { backgroundColor: palette.divider }]} />
              <ProfileRow
                title="سياسة الخصوصية"
                subtitle="كيف نحمي بياناتك الطبية وحسابك"
                icon="shield-outline"
                details={[
                  "يتم حفظ الجلسة محلياً بشكل آمن على الجهاز.",
                  "تعرض الصفحة فقط البيانات الطبية المرتبطة بحسابك الشخصي.",
                  "يمكنك تسجيل الخروج في أي وقت لإنهاء الجلسة الحالية."
                ]}
                expanded={Boolean(expandedRows.privacyPolicy)}
                onPress={() => handleAccordionToggle("privacyPolicy")}
                palette={palette}
              />
            </ProfileGroup>

            <Pressable
              disabled={loggingOut}
              onPress={async () => {
                try {
                  setLoggingOut(true);
                  await sessionManager.clear();
                  showToast({ title: "تم تسجيل الخروج", description: "نراك قريبًا" });
                } finally {
                  setLoggingOut(false);
                }
              }}
              style={[
                styles.logoutButton,
                {
                  backgroundColor: palette.logoutBackground,
                  borderColor: palette.logoutBorder,
                  opacity: loggingOut ? 0.72 : 1
                }
              ]}
            >
              <Ionicons name="log-out-outline" size={18} color={palette.danger} />
              <Text style={[styles.logoutText, { color: palette.danger }]}>
                {loggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
              </Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ title, palette }: { title: string; palette: ProfilePalette }) {
  return <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>{title}</Text>;
}

function ProfileIconButton({
  icon,
  onPress,
  palette
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  palette: ProfilePalette;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.iconButton, { backgroundColor: palette.panel, borderColor: palette.line }]}>
      <Ionicons name={icon} size={18} color={palette.text} />
    </Pressable>
  );
}

function ProfileMetricCard({
  title,
  value,
  unit,
  onPress,
  palette
}: {
  title: string;
  value: string;
  unit: string;
  onPress: () => void;
  palette: ProfilePalette;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.metricCard, { backgroundColor: palette.panel, borderColor: palette.line }]}>
      <Text style={[styles.metricLabel, { color: palette.textMuted }]}>{title}</Text>
      <Text style={[styles.metricValue, { color: palette.primary }]}>{value}</Text>
      <Text style={[styles.metricUnit, { color: palette.textMuted }]}>{unit}</Text>
    </Pressable>
  );
}

function ProfileGroup({ children, palette }: { children: ReactNode; palette: ProfilePalette }) {
  return <View style={[styles.groupCard, { backgroundColor: palette.panel, borderColor: palette.line }]}>{children}</View>;
}

function ProfileRow({
  title,
  subtitle,
  icon,
  onPress,
  palette,
  details,
  expanded = false,
  trailing
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  palette: ProfilePalette;
  details?: string[];
  expanded?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: palette.panelSoft, borderColor: palette.line }]}>
        <Ionicons name={icon} size={18} color={palette.primary} />
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
          <View style={styles.rowTitleWrap}>
            <Text style={[styles.rowTitle, { color: palette.text }]}>{title}</Text>
            <Text style={[styles.rowSubtitle, { color: palette.textMuted }]} numberOfLines={expanded ? undefined : 1}>
              {subtitle}
            </Text>
          </View>
          {trailing ?? <Ionicons name={expanded ? "chevron-down" : "chevron-back"} size={18} color={palette.textMuted} />}
        </View>

        {expanded
          ? details?.map((detail) => (
              <Text key={detail} style={[styles.rowDetail, { color: palette.textSoft }]}>
                {detail}
              </Text>
            ))
          : null}
      </View>
    </Pressable>
  );
}

function ProfileSwitchRow({
  title,
  subtitle,
  icon,
  value,
  onValueChange,
  palette
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: boolean;
  onValueChange: (value: boolean) => void;
  palette: ProfilePalette;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: palette.panelSoft, borderColor: palette.line }]}>
        <Ionicons name={icon} size={18} color={palette.primary} />
      </View>
      <View style={styles.switchRowContent}>
        <View style={styles.rowTitleWrap}>
          <Text style={[styles.rowTitle, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.rowSubtitle, { color: palette.textMuted }]}>{subtitle}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: palette.switchTrack, true: palette.primary }}
          thumbColor={value ? palette.switchThumbActive : palette.switchThumb}
          ios_backgroundColor={palette.switchTrack}
        />
      </View>
    </View>
  );
}

function createProfilePalette(theme: AppTheme, isDark: boolean) {
  if (isDark) {
    return {
      page: "#06111B",
      panel: "#0E1A28",
      panelSoft: "#132537",
      line: "rgba(77, 95, 117, 0.34)",
      divider: "rgba(71, 85, 105, 0.22)",
      text: "#F4FBFF",
      textMuted: "#8EA3B7",
      textSoft: "#AFC0CF",
      primary: "#31D6CC",
      accent: "#25C7E8",
      primarySoft: "rgba(49,214,204,0.14)",
      glowPrimary: "rgba(37,199,232,0.16)",
      glowAccent: "rgba(49,214,204,0.18)",
      backgroundGradient: ["#06111B", "#081824", "#06111B"] as [string, string, string],
      grid: "rgba(255,255,255,0.03)",
      logoutBackground: "rgba(94, 18, 34, 0.48)",
      logoutBorder: "rgba(214,103,113,0.22)",
      danger: "#F06B76",
      shadow: "rgba(2, 8, 23, 0.62)",
      switchTrack: "#233447",
      switchThumb: "#C8D4DD",
      switchThumbActive: "#08131D"
    };
  }

  return {
    page: theme.colors.background.primary,
    panel: theme.colors.background.elevated,
    panelSoft: "#EEF5F8",
    line: "rgba(84, 100, 118, 0.18)",
    divider: "rgba(84, 100, 118, 0.12)",
    text: theme.colors.text.primary,
    textMuted: theme.colors.text.secondary,
    textSoft: "#73869A",
    primary: theme.colors.brand.primary,
    accent: theme.colors.brand.accent,
    primarySoft: "rgba(24,155,147,0.10)",
    glowPrimary: "rgba(36,197,231,0.14)",
    glowAccent: "rgba(24,155,147,0.14)",
    backgroundGradient: [
      theme.colors.background.primary,
      theme.colors.background.secondary,
      theme.colors.background.primary
    ] as [string, string, string],
    grid: "rgba(84, 100, 118, 0.08)",
    logoutBackground: "rgba(222,91,100,0.10)",
    logoutBorder: "rgba(222,91,100,0.18)",
    danger: theme.colors.danger,
    shadow: theme.colors.glass.shadow,
    switchTrack: "#CFDDE6",
    switchThumb: "#FFFFFF",
    switchThumbActive: "#FFFFFF"
  };
}

type ProfilePalette = ReturnType<typeof createProfilePalette>;

function buildMedicalRecordSummary(city?: string | null, region?: string | null, gender?: string | null) {
  const parts = [city || "المدينة غير محددة", region || "المنطقة غير محددة", formatGender(gender)];
  return parts.join(" • ");
}

function buildMedicalChecksSummary(bloodType?: string | null, age?: number | null) {
  if (!bloodType && !age) {
    return "البيانات الأساسية غير مكتملة حتى الآن";
  }

  if (!bloodType) {
    return `العمر المسجل ${age} سنة`;
  }

  if (!age) {
    return `فصيلة الدم ${bloodType}`;
  }

  return `فصيلة الدم ${bloodType} • العمر ${age} سنة`;
}

function buildMedicationSummary(currentMedications?: string | null) {
  if (!currentMedications) {
    return "لا توجد أدوية حالية مسجلة";
  }

  return currentMedications.length > 48 ? `${currentMedications.slice(0, 48).trim()}...` : currentMedications;
}

function formatGender(value?: string | null) {
  if (value === "male") {
    return "ذكر";
  }

  if (value === "female") {
    return "أنثى";
  }

  return "غير محدد";
}

function formatBirthDate(value?: string | null) {
  if (!value) {
    return "غير معروف";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "غير معروف";
  }

  return new Intl.DateTimeFormat("ar", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function formatAppointmentDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "لم يتم تحديد التاريخ";
  }

  return new Intl.DateTimeFormat("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatUserStatus(value?: string | null) {
  if (!value) {
    return "مريض";
  }

  if (value === "active") {
    return "حساب نشط";
  }

  if (value === "approved") {
    return "موثق";
  }

  if (value === "pending") {
    return "قيد المراجعة";
  }

  if (value === "suspended") {
    return "مقيّد";
  }

  return "مريض";
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 16,
    overflow: "hidden"
  },
  glowPrimary: {
    position: "absolute",
    top: -80,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 240
  },
  glowAccent: {
    position: "absolute",
    bottom: -120,
    left: -40,
    width: 280,
    height: 280,
    borderRadius: 280
  },
  grid: {
    position: "absolute",
    top: -110,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 34,
    borderWidth: 1,
    transform: [{ rotate: "16deg" }]
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  screenTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 20
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: "center",
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10
  },
  avatarRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  avatarBadge: {
    position: "absolute",
    left: 6,
    bottom: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  name: {
    marginTop: 14,
    fontFamily: "Cairo_700Bold",
    fontSize: 28
  },
  statusPill: {
    marginTop: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6
  },
  statusPillText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 12
  },
  email: {
    marginTop: 8,
    fontFamily: "Cairo_500Medium",
    fontSize: 13
  },
  progressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 16
  },
  progressFill: {
    height: "100%",
    borderRadius: 999
  },
  editProfileButton: {
    marginTop: 14,
    width: "100%",
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  editProfileButtonText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 14
  },
  metricsRow: {
    flexDirection: "row-reverse",
    gap: 10
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 12
  },
  metricLabel: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 12
  },
  metricValue: {
    fontFamily: "Cairo_700Bold",
    fontSize: 26,
    marginTop: 2
  },
  metricUnit: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 11
  },
  nextAppointmentCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row-reverse",
    gap: 12,
    alignItems: "center"
  },
  nextAppointmentIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  nextAppointmentCopy: {
    flex: 1,
    alignItems: "flex-end"
  },
  nextAppointmentLabel: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12
  },
  nextAppointmentTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16
  },
  nextAppointmentMeta: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12
  },
  sectionLabel: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15,
    textAlign: "right",
    marginTop: 4
  },
  groupCard: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden"
  },
  divider: {
    height: 1,
    marginHorizontal: 18
  },
  row: {
    flexDirection: "row-reverse",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "flex-start"
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  rowContent: {
    flex: 1,
    alignItems: "flex-end",
    gap: 6
  },
  switchRowContent: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between"
  },
  rowHeader: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  rowTitleWrap: {
    flex: 1,
    alignItems: "flex-end"
  },
  rowTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16
  },
  rowSubtitle: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    textAlign: "right"
  },
  rowDetail: {
    width: "100%",
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    lineHeight: 22,
    textAlign: "right"
  },
  trailingMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4
  },
  trailingValue: {
    fontFamily: "Cairo_700Bold",
    fontSize: 13
  },
  logoutButton: {
    marginTop: 4,
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  logoutText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16
  }
});
