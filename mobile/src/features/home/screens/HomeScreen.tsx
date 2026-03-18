import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

import { PatientHeader } from "@/features/home/components/PatientHeader";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSearchBar } from "@/features/home/components/PatientSearchBar";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { patientPalette } from "@/features/home/components/patient-theme";
import { useHomeFeed } from "@/features/home";
import { DoctorCard } from "@/shared/components/DoctorCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Loader } from "@/shared/components/Loader";
import { useAuthStore } from "@/store/auth/auth.store";

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { search, setSearch, doctorsQuery, postsQuery } = useHomeFeed();
  const currentUser = useAuthStore((state) => state.user);

  return (
    <PatientScreen>
      <PatientHeader title={currentUser?.fullName ?? "حسابك"} subtitle="مرحبًا بك" />
      <PatientSearchBar value={search} onChangeText={setSearch} />
      <View style={{ flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" }}>
        {["الكل", "طب الأطفال", "الباطني", "القلب"].map((item, index) => (
          <View
            key={item}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: index === 0 ? patientPalette.primary : patientPalette.panel,
              borderWidth: 1,
              borderColor: index === 0 ? "transparent" : patientPalette.glassBorder
            }}
          >
            <Text style={{ color: index === 0 ? "#FFFFFF" : patientPalette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 13 }}>{item}</Text>
          </View>
        ))}
      </View>

      <PatientSurface style={{ minHeight: 160, justifyContent: "space-between", overflow: "hidden" }}>
        <LinearGradient colors={[patientPalette.primaryStrong, patientPalette.primary, "#1B827D"]} style={{ position: "absolute", inset: 0 }} />
        <View style={{ position: "absolute", left: 16, bottom: 16, width: 88, height: 88, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 42 }}>✚</Text>
        </View>
        <View style={{ alignItems: "flex-end", paddingLeft: 80 }}>
          <Text style={{ color: "#FFFFFF", fontFamily: "Cairo_700Bold", fontSize: 28 }}>صحتك تهمنا</Text>
          <Text style={{ color: "rgba(255,255,255,0.82)", fontFamily: "Cairo_500Medium", lineHeight: 24, textAlign: "right" }}>
            احصل على استشارة مجانية لأول مرة مع فريق من الأطباء.
          </Text>
        </View>
        <View style={{ alignSelf: "flex-end", backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}>
          <Text style={{ color: patientPalette.primaryStrong, fontFamily: "Cairo_700Bold" }}>اكتشف الآن</Text>
        </View>
      </PatientSurface>

      <View style={{ flexDirection: "row-reverse", gap: 12 }}>
        <QuickCard title="طلب استشارة" icon="chatbox-ellipses" onPress={() => navigation.navigate("ConsultationRequest")} />
        <QuickCard title="حجز موعد" icon="calendar" onPress={() => navigation.navigate("StartBooking")} />
      </View>

      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 24 }}>أفضل الأطباء</Text>
        <Pressable onPress={() => navigation.navigate("DoctorsTab")}>
          <Text style={{ color: patientPalette.primary, fontFamily: "Cairo_700Bold", fontSize: 13 }}>عرض الكل</Text>
        </Pressable>
      </View>
      {doctorsQuery.isLoading ? <Loader /> : null}
      {doctorsQuery.isError ? <ErrorState message="تعذر تحميل الأطباء" onRetry={doctorsQuery.refetch} /> : null}
      {doctorsQuery.data?.length === 0 ? <EmptyState title="لا يوجد نتائج" description="جرّب تخصصًا أو اسمًا مختلفًا." /> : null}
      {doctorsQuery.data?.length ? (
        <View style={{ gap: 14 }}>
          {doctorsQuery.data.map((item) => (
            <DoctorCard key={item.id} doctor={item} onPress={() => navigation.navigate("DoctorDetails", { doctorId: item.id })} />
          ))}
        </View>
      ) : null}
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 24 }}>نصائح ومنشورات</Text>
        <Text style={{ color: patientPalette.primary, fontFamily: "Cairo_700Bold", fontSize: 13 }}>عرض الكل</Text>
      </View>
      <View style={{ gap: 12 }}>
        {postsQuery.data?.slice(0, 3).map((post) => (
          <PatientSurface key={post.id}>
            <View style={{ height: 150, borderRadius: 18, backgroundColor: "#1C2D3B", marginBottom: 12 }} />
            <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 16, textAlign: "right" }}>{post.title}</Text>
            <Text numberOfLines={2} style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", lineHeight: 24, textAlign: "right" }}>
              {post.content}
            </Text>
            <View style={{ alignSelf: "flex-end", marginTop: 8, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: patientPalette.panelSoft }}>
              <Text style={{ color: patientPalette.primary, fontFamily: "Cairo_700Bold", fontSize: 13 }}>اقرأ المزيد</Text>
            </View>
          </PatientSurface>
        ))}
      </View>
    </PatientScreen>
  );
}

function QuickCard({
  title,
  icon,
  onPress
}: {
  title: string;
  icon: "chatbox-ellipses" | "calendar";
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <PatientSurface style={{ minHeight: 118, alignItems: "center", justifyContent: "center", gap: 10 }}>
        <View style={{ width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: `${patientPalette.primary}20` }}>
          <Text style={{ color: patientPalette.primary, fontSize: 22 }}>{icon === "calendar" ? "🗓" : "💬"}</Text>
        </View>
        <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 16 }}>{title}</Text>
      </PatientSurface>
    </Pressable>
  );
}
