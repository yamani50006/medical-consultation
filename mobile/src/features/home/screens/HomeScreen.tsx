import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { HomeArticleHighlightCard } from "@/features/home/components/HomeArticleHighlightCard";
import { HomeDoctorSpotlightCard } from "@/features/home/components/HomeDoctorSpotlightCard";
import { HomeHeroBanner } from "@/features/home/components/HomeHeroBanner";
import { HomeQuickActionCard } from "@/features/home/components/HomeQuickActionCard";
import { HomeSectionHeader } from "@/features/home/components/HomeSectionHeader";
import { HomeSectionStateCard } from "@/features/home/components/HomeSectionStateCard";
import { PatientHeader } from "@/features/home/components/PatientHeader";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSearchBar } from "@/features/home/components/PatientSearchBar";
import { usePatientPalette } from "@/features/home/components/patient-theme";
import { useHomeFeed } from "@/features/home";
import { useAuthStore } from "@/store/auth/auth.store";

const quickActions = [
  { key: "appointments", title: "حجز موعد", icon: "calendar-outline" as const, route: "StartBooking" },
  { key: "request", title: "طلب استشارة", icon: "chatbubble-outline" as const, route: "ConsultationRequest" },
  { key: "consultations", title: "استشاراتي", icon: "reader-outline" as const, route: "MyConsultations" }
] as const;

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { search, setSearch, doctorsQuery, postsQuery, featuredDoctors, featuredPosts } = useHomeFeed();
  const currentUser = useAuthStore((state) => state.user);
  const patientPalette = usePatientPalette();

  const subtitle = useMemo(() => {
    if (!currentUser?.fullName) {
      return "مرحبًا بك";
    }

    const firstName = currentUser.fullName.trim().split(" ")[0];
    return `مرحبًا بك ${firstName}`;
  }, [currentUser?.fullName]);

  const featuredPost = featuredPosts[0];

  return (
    <PatientScreen>
      <PatientHeader
        title="الرئيسية"
        subtitle={subtitle}
        avatarName={currentUser?.fullName ?? "المريض"}
        avatarImageUrl={currentUser?.profileImageUrl}
        onNotificationPress={() => navigation.navigate("Notifications")}
      />

      <PatientSearchBar value={search} onChangeText={setSearch} placeholder="ابحث عن تخصص أو طبيب" />

      <HomeHeroBanner
        title="صحتك تهمنا"
        description="احصل على استشارات مجانية وفورية مع نخبة من الأطباء المتخصصين."
        ctaLabel="اكتشف الآن"
        onPress={() => navigation.navigate("ConsultationRequest")}
      />

      <View style={styles.quickActionsRow}>
        {quickActions.map((item) => (
          <HomeQuickActionCard
            key={item.key}
            title={item.title}
            icon={item.icon}
            onPress={() => navigation.navigate(item.route)}
          />
        ))}
      </View>

      <View style={styles.sectionBlock}>
        <HomeSectionHeader title="أفضل الأطباء" actionLabel="عرض الكل" onActionPress={() => navigation.navigate("DoctorsTab")} />
        {doctorsQuery.isLoading ? (
          <HomeSectionStateCard
            title="جاري تحميل الأطباء"
            description="نجهز لك الأطباء الأعلى تقييمًا والمتاحين الآن."
            isLoading
          />
        ) : null}
        {doctorsQuery.isError ? (
          <HomeSectionStateCard
            title="تعذر تحميل الأطباء"
            description="حدثت مشكلة أثناء جلب البيانات. حاول مرة أخرى."
            actionLabel="إعادة المحاولة"
            onActionPress={() => doctorsQuery.refetch()}
            tone="danger"
          />
        ) : null}
        {!doctorsQuery.isLoading && !doctorsQuery.isError && featuredDoctors.length === 0 ? (
          <HomeSectionStateCard
            title="لا توجد نتائج حالياً"
            description={search ? "جرّب تعديل البحث أو استخدام اسم تخصص آخر." : "سيظهر الأطباء هنا بمجرد توفر بيانات مناسبة."}
            actionLabel={search ? "مسح البحث" : undefined}
            onActionPress={search ? () => setSearch("") : undefined}
          />
        ) : null}
        {!doctorsQuery.isLoading && !doctorsQuery.isError && featuredDoctors.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.doctorsScroller}
          >
            {featuredDoctors.map((doctor) => (
              <HomeDoctorSpotlightCard
                key={doctor.id}
                doctor={doctor}
                onPress={() => navigation.navigate("DoctorDetails", { doctorId: doctor.id })}
              />
            ))}
          </ScrollView>
        ) : null}
      </View>

      <View style={styles.sectionBlock}>
        <HomeSectionHeader title="نصائح ومنشورات" />
        {postsQuery.isLoading ? (
          <HomeSectionStateCard
            title="جاري تحميل المحتوى الطبي"
            description="نجهز لك أحدث النصائح والمنشورات الموثوقة."
            isLoading
          />
        ) : null}
        {postsQuery.isError ? (
          <HomeSectionStateCard
            title="تعذر تحميل المنشورات"
            description="تعذر جلب المحتوى الآن. أعد المحاولة بعد قليل."
            actionLabel="إعادة المحاولة"
            onActionPress={() => postsQuery.refetch()}
            tone="danger"
          />
        ) : null}
        {!postsQuery.isLoading && !postsQuery.isError && !featuredPost ? (
          <HomeSectionStateCard
            title="لا توجد منشورات متاحة"
            description="سيظهر المحتوى التثقيفي الطبي هنا عند نشره."
          />
        ) : null}
        {!postsQuery.isLoading && !postsQuery.isError && featuredPost ? (
          <HomeArticleHighlightCard post={featuredPost} />
        ) : null}
        {!postsQuery.isLoading && !postsQuery.isError && featuredPosts.length > 1 ? (
          <Text style={[styles.articleHint, { color: patientPalette.textMuted }]}>
            يتم تحديث هذه النصائح باستمرار من المحتوى الطبي المعتمد.
          </Text>
        ) : null}
      </View>
    </PatientScreen>
  );
}

const styles = StyleSheet.create({
  quickActionsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 2
  },
  sectionBlock: {
    gap: 14
  },
  doctorsScroller: {
    flexDirection: "row-reverse",
    gap: 12,
    paddingRight: 4
  },
  articleHint: {
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right"
  }
});
