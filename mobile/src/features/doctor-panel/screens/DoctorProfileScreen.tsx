import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DoctorSurface } from "@/features/doctor-panel/components/DoctorSurface";
import { doctorPalette } from "@/features/doctor-panel/components/doctor-theme";
import { DoctorAvailabilitySlotEntity } from "@/domain/entities/Doctor";
import { useUpdateMyDoctorProfileMutation } from "@/features/doctors/hooks/useDoctorProfileMutations";
import { useMyDoctorProfileQuery } from "@/features/doctors/hooks/useDoctorQueries";
import { Avatar } from "@/shared/components/Avatar";
import { ErrorState } from "@/shared/components/ErrorState";
import { Loader } from "@/shared/components/Loader";

const WEEKDAY_OPTIONS = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الاثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" }
] as const;

const TIME_OPTIONS = buildTimeOptions();

export function DoctorProfileScreen() {
  const profileQuery = useMyDoctorProfileQuery();
  const updateProfile = useUpdateMyDoctorProfileMutation();
  const [availabilityDraft, setAvailabilityDraft] = useState<DoctorAvailabilitySlotEntity[]>([]);

  useEffect(() => {
    if (profileQuery.data) {
      setAvailabilityDraft(normalizeAvailability(profileQuery.data.availabilitySlots));
    }
  }, [profileQuery.data]);

  if (profileQuery.isLoading && !profileQuery.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: doctorPalette.page }}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: doctorPalette.page, padding: 18 }}>
        <ErrorState message="تعذر تحميل ملف الطبيب" onRetry={profileQuery.refetch} />
      </SafeAreaView>
    );
  }

  const doctor = profileQuery.data;
  const savedAvailability = normalizeAvailability(doctor.availabilitySlots);
  const hasChanges = !areAvailabilityListsEqual(savedAvailability, availabilityDraft);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: doctorPalette.page }}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 18 }} showsVerticalScrollIndicator={false}>
        <DoctorSurface style={{ alignItems: "center", paddingVertical: 28 }}>
          <Avatar name={doctor.fullName} imageUrl={doctor.profileImageUrl} size={92} />
          <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 28, marginTop: 14 }}>
            {doctor.fullName}
          </Text>
          <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_500Medium" }}>{doctor.specialization}</Text>
          <View style={{ flexDirection: "row-reverse", gap: 10, marginTop: 14 }}>
            <MetaPill icon="calendar-outline" label={`${availabilityDraft.length} موعد متاح`} />
            <MetaPill icon="pulse-outline" label={doctor.isAvailableNow ? "متاح الآن" : "غير متاح الآن"} />
          </View>
        </DoctorSurface>

        <DoctorSurface style={{ gap: 10 }}>
          <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 20, textAlign: "right" }}>
            جدول الحجز الأسبوعي
          </Text>
          <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right", lineHeight: 24 }}>
            المريض سيشاهد فقط الأوقات التي تختارها هنا، وأي وقت يتم حجزه سيختفي تلقائياً من صفحة الحجز.
          </Text>
          <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: doctorPalette.primary, fontFamily: "Cairo_700Bold" }}>
              {availabilityDraft.length === 0 ? "لم يتم تحديد أوقات بعد" : `تم تحديد ${availabilityDraft.length} موعد متكرر`}
            </Text>
            <Pressable onPress={() => setAvailabilityDraft([])} hitSlop={8}>
              <Text style={{ color: doctorPalette.red, fontFamily: "Cairo_700Bold" }}>مسح الكل</Text>
            </Pressable>
          </View>
        </DoctorSurface>

        {WEEKDAY_OPTIONS.map((day) => {
          const daySlots = availabilityDraft.filter((slot) => slot.weekday === day.value);

          return (
            <DoctorSurface key={day.value} style={{ gap: 12 }}>
              <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 18 }}>{day.label}</Text>
                <Text style={{ color: doctorPalette.textMuted, fontFamily: "Cairo_600SemiBold", fontSize: 12 }}>
                  {daySlots.length === 0 ? "بدون مواعيد" : `${daySlots.length} وقت`}
                </Text>
              </View>

              <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }}>
                {TIME_OPTIONS.map((time) => {
                  const selected = daySlots.some((slot) => slot.time === time.value);

                  return (
                    <Pressable
                      key={`${day.value}-${time.value}`}
                      onPress={() => setAvailabilityDraft((current) => toggleAvailabilitySlot(current, day.value, time.value))}
                      style={({ pressed }) => ({
                        minWidth: 84,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 14,
                        alignItems: "center",
                        backgroundColor: selected ? doctorPalette.primarySoft : doctorPalette.panelSoft,
                        borderWidth: 1,
                        borderColor: selected ? doctorPalette.primary : doctorPalette.lineSoft,
                        opacity: pressed ? 0.84 : 1
                      })}
                    >
                      <Text
                        style={{
                          color: selected ? doctorPalette.primary : doctorPalette.textMuted,
                          fontFamily: "Cairo_700Bold",
                          fontSize: 13
                        }}
                      >
                        {time.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </DoctorSurface>
          );
        })}

        <Pressable
          onPress={async () => {
            await updateProfile.mutateAsync({ availabilitySlots: availabilityDraft });
          }}
          disabled={updateProfile.isPending || !hasChanges}
          style={({ pressed }) => ({
            minHeight: 56,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: !hasChanges ? doctorPalette.panelSoft : doctorPalette.primary,
            borderWidth: 1,
            borderColor: !hasChanges ? doctorPalette.lineSoft : "transparent",
            opacity: pressed ? 0.88 : 1,
            marginBottom: 18
          })}
        >
          {updateProfile.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ color: hasChanges ? "#FFFFFF" : doctorPalette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 15 }}>
              {hasChanges ? "حفظ جدول الحجز" : "لا توجد تعديلات للحفظ"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaPill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View
      style={{
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: doctorPalette.panelSoft,
        borderWidth: 1,
        borderColor: doctorPalette.lineSoft
      }}
    >
      <Ionicons name={icon} size={14} color={doctorPalette.primary} />
      <Text style={{ color: doctorPalette.text, fontFamily: "Cairo_700Bold", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function buildTimeOptions() {
  const slots: { value: string; label: string }[] = [];

  for (let hour = 8; hour <= 20; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 20 && minute === 30) {
        continue;
      }

      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      slots.push({
        value,
        label: new Intl.DateTimeFormat("ar-SA", {
          hour: "numeric",
          minute: "2-digit"
        }).format(date)
      });
    }
  }

  return slots;
}

function toggleAvailabilitySlot(current: DoctorAvailabilitySlotEntity[], weekday: number, time: string) {
  const exists = current.some((slot) => slot.weekday === weekday && slot.time === time);
  if (exists) {
    return current.filter((slot) => !(slot.weekday === weekday && slot.time === time));
  }

  return normalizeAvailability([...current, { weekday, time }]);
}

function normalizeAvailability(slots: DoctorAvailabilitySlotEntity[]) {
  return [...slots].sort((left, right) => {
    if (left.weekday !== right.weekday) {
      return left.weekday - right.weekday;
    }

    return left.time.localeCompare(right.time);
  });
}

function areAvailabilityListsEqual(left: DoctorAvailabilitySlotEntity[], right: DoctorAvailabilitySlotEntity[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((slot, index) => slot.weekday === right[index]?.weekday && slot.time === right[index]?.time);
}
