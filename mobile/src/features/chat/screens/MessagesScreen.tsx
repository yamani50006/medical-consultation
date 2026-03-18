import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import { useConversationsQuery } from "@/features/chat";
import { PatientHeader } from "@/features/home/components/PatientHeader";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { PatientSearchBar } from "@/features/home/components/PatientSearchBar";
import { patientPalette } from "@/features/home/components/patient-theme";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Loader } from "@/shared/components/Loader";

export function MessagesScreen() {
  const [search, setSearch] = useState("");
  const query = useConversationsQuery({ limit: 20 });
  const conversations = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) {
      return query.data ?? [];
    }

    return (query.data ?? []).filter((item) =>
      [item.counterpartName, item.lastMessagePreview, item.counterpartSpecialization].some((value) =>
        value?.toLowerCase().includes(normalized)
      )
    );
  }, [query.data, search]);

  return (
    <PatientScreen>
      <PatientHeader title="محادثاتك" subtitle="تواصل مباشر مع الأطباء" />
      <PatientSearchBar value={search} onChangeText={setSearch} placeholder="ابحث في المحادثات..." />

      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState message="تعذر تحميل المحادثات" onRetry={query.refetch} /> : null}
      {!query.isLoading && !query.isError && conversations.length === 0 ? (
        <EmptyState
          title={search ? "لا توجد نتائج مطابقة" : "لا توجد محادثات بعد"}
          description={search ? "جرّب البحث باسم الطبيب أو آخر رسالة." : "عند بدء محادثة جديدة مع الطبيب ستظهر هنا."}
        />
      ) : null}

      <View style={{ gap: 12 }}>
        {conversations.map((item) => (
          <PatientSurface key={item.id} style={{ paddingVertical: 14 }}>
            <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: `${patientPalette.primary}20`, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold" }}>د</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end", gap: 2 }}>
                <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 17 }}>{item.counterpartName}</Text>
                <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 13 }}>
                  {item.lastMessagePreview ?? item.consultationSubject ?? "ابدأ المحادثة مع الطبيب"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-start" }}>
                {item.unreadCount > 0 ? (
                  <View style={{ minWidth: 20, height: 20, borderRadius: 999, backgroundColor: patientPalette.green, alignSelf: "flex-start", marginBottom: 6, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}>
                    <Text style={{ color: "#FFFFFF", fontFamily: "Cairo_700Bold", fontSize: 10 }}>{item.unreadCount}</Text>
                  </View>
                ) : (
                  <View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: patientPalette.green, alignSelf: "flex-start", marginBottom: 6 }} />
                )}
                <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 12 }}>{formatConversationTime(item.lastMessageAt)}</Text>
              </View>
            </View>
          </PatientSurface>
        ))}
      </View>
    </PatientScreen>
  );
}

function formatConversationTime(value?: string | null) {
  if (!value) {
    return "الآن";
  }

  const date = new Date(value);
  const diffInHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return "الآن";
  }

  if (diffInHours < 24) {
    return `منذ ${diffInHours} ساعة`;
  }

  return new Intl.DateTimeFormat("ar", {
    day: "numeric",
    month: "short"
  }).format(date);
}
