import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useBookAppointmentMutation, useBookingForm } from "@/features/appointments";
import { useDoctorAppointmentSlotsQuery } from "@/features/doctors/hooks/useDoctorQueries";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { PatientPalette, usePatientPalette } from "@/features/home/components/patient-theme";
import { DoctorAppointmentSlotEntity } from "@/domain/entities/Doctor";
import { PatientStackParamList } from "@/navigation/types";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { InputField } from "@/shared/components/InputField";
import { Loader } from "@/shared/components/Loader";
import { ScreenHeader } from "@/shared/components/ScreenHeader";

type Props = NativeStackScreenProps<PatientStackParamList, "Booking">;
type BookingDayGroup = {
  key: string;
  appointmentDate: string;
  dayNumber: string;
  weekdayLabel: string;
  monthLabel: string;
  slots: DoctorAppointmentSlotEntity[];
};

export function BookingScreen({ route, navigation }: Props) {
  const form = useBookingForm();
  const book = useBookAppointmentMutation(route.params.doctorId);
  const slotsQuery = useDoctorAppointmentSlotsQuery(route.params.doctorId, { days: 14 });
  const patientPalette = usePatientPalette();
  const styles = createStyles(patientPalette);
  const availableDays = groupDoctorAppointmentSlots(slotsQuery.data ?? []);
  const [selectedDayKey, setSelectedDayKey] = useState("");
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState("");
  const appointmentDate = form.watch("appointmentDate");
  const appointmentDateError = form.formState.errors.appointmentDate;
  const selectedDay =
    availableDays.find((day) => day.key === selectedDayKey) ??
    (selectedDayKey === "" ? availableDays[0] : null) ??
    null;

  useEffect(() => {
    if (availableDays.length === 0) {
      if (selectedDayKey !== "") {
        setSelectedDayKey("");
      }

      if (selectedAppointmentDate !== "") {
        setSelectedAppointmentDate("");
      }

      if (appointmentDate !== "") {
        form.setValue("appointmentDate", "", {
          shouldDirty: appointmentDate.length > 0,
          shouldValidate: false
        });
      }

      return;
    }

    const nextDayKey = availableDays.some((day) => day.key === selectedDayKey) ? selectedDayKey : availableDays[0].key;
    if (nextDayKey !== selectedDayKey) {
      setSelectedDayKey(nextDayKey);
    }
  }, [appointmentDate, availableDays, form, selectedAppointmentDate, selectedDayKey]);

  useEffect(() => {
    if (!selectedDay) {
      return;
    }

    const nextAppointmentDate = selectedDay.slots.some((slot) => slot.appointmentDate === selectedAppointmentDate)
      ? selectedAppointmentDate
      : selectedDay.slots[0]?.appointmentDate ?? "";

    if (selectedAppointmentDate !== nextAppointmentDate) {
      setSelectedAppointmentDate(nextAppointmentDate);
    }

    if (appointmentDate !== nextAppointmentDate) {
      form.setValue("appointmentDate", nextAppointmentDate, {
        shouldDirty: appointmentDate.length > 0,
        shouldValidate: true
      });
    }
  }, [appointmentDate, form, selectedAppointmentDate, selectedDay]);

  return (
    <PatientScreen>
      <ScreenHeader title="حجز موعد" subtitle="يمكنك الرجوع وتعديل الاختيار في أي وقت" />
      <PatientSurface style={{ minHeight: 120, justifyContent: "space-between" }}>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 26 }}>متابعة الحجز</Text>
          <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium" }}>
            اختر من جدول الطبيب الحقيقي والأوقات غير المحجوزة فقط
          </Text>
        </View>
        <Text style={{ color: patientPalette.primary, fontFamily: "Cairo_700Bold", textAlign: "right" }}>
          الطبيب: {route.params.doctorName ?? "الطبيب المختار"}
        </Text>
      </PatientSurface>

      <PatientSurface style={{ borderRadius: 32 }}>
        <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 18, textAlign: "right" }}>اختر الموعد</Text>
        <Text style={styles.sectionHint}>المواعيد أدناه مرتبطة بالجدول الذي حدده الطبيب وتمت تصفية المحجوز منها.</Text>

        {slotsQuery.isLoading ? <Loader /> : null}
        {slotsQuery.isError ? <ErrorState message="تعذر تحميل مواعيد الطبيب الحالية" onRetry={slotsQuery.refetch} /> : null}

        {!slotsQuery.isLoading && !slotsQuery.isError && availableDays.length > 0 ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dayScroll}
              contentContainerStyle={styles.dayGrid}
            >
              {availableDays.map((day) => {
                const isSelected = day.key === selectedDay?.key;

                return (
                  <Pressable
                    key={day.key}
                    onPress={() => setSelectedDayKey(day.key)}
                    style={({ pressed }) => [
                      styles.dayChip,
                      isSelected && styles.dayChipSelected,
                      pressed && !isSelected && styles.chipPressed
                    ]}
                  >
                    <Text style={[styles.dayNumber, isSelected && styles.dayTextSelected]}>{day.dayNumber}</Text>
                    <Text style={[styles.dayMeta, isSelected && styles.dayMetaSelected]}>{`${day.weekdayLabel} ${day.monthLabel}`}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.timeGrid}>
              {selectedDay?.slots.map((slot) => {
                const isSelected = slot.appointmentDate === selectedAppointmentDate;

                return (
                  <Pressable
                    key={slot.appointmentDate}
                    onPress={() => setSelectedAppointmentDate(slot.appointmentDate)}
                    style={({ pressed }) => [
                      styles.timeChip,
                      isSelected && styles.timeChipSelected,
                      pressed && !isSelected && styles.chipPressed
                    ]}
                  >
                    <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>
                      {formatSlotTime(slot.appointmentDate)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {!slotsQuery.isLoading && !slotsQuery.isError && availableDays.length === 0 ? (
          <EmptyState
            title="لا توجد مواعيد متاحة"
            description="هذا الطبيب لم يضف أوقات حجز بعد، أو أن جميع المواعيد القادمة محجوزة حالياً."
          />
        ) : null}

        <View style={styles.selectionBlock}>
          <Text style={styles.selectionLabel}>التاريخ والوقت</Text>
          <View style={[styles.selectionCard, appointmentDateError ? styles.selectionCardError : null]}>
            <Text style={styles.selectionValue}>
              {appointmentDate ? formatSelectedAppointment(appointmentDate) : "اختر التاريخ والوقت لتأكيد الحجز"}
            </Text>
            <Text style={styles.selectionHint}>
              {appointmentDate ? "هذا الموعد متاح حالياً وفق جدول الطبيب." : "لن يتم إرسال الطلب قبل تحديد موعد صالح."}
            </Text>
          </View>
          {appointmentDateError ? <Text style={styles.errorText}>{appointmentDateError.message}</Text> : null}
        </View>

        <InputField control={form.control} name="notes" label="ملاحظات للحالة" multiline placeholder="اكتب الأعراض أو ما تود إيصاله للطبيب" />
        <Button
          title="تأكيد الحجز"
          loading={book.isPending}
          style={{marginTop:4}}
          disabled={!appointmentDate || slotsQuery.isLoading || slotsQuery.isError}
          onPress={form.handleSubmit(async (values) => {
            await book.mutateAsync(values);
            navigation.goBack();
          })}
        />
      </PatientSurface>
    </PatientScreen>
  );
}

function groupDoctorAppointmentSlots(slots: DoctorAppointmentSlotEntity[]): BookingDayGroup[] {
  const groups = new Map<string, BookingDayGroup>();

  for (const slot of slots) {
    const key = formatDateKey(slot.appointmentDate);
    const currentGroup = groups.get(key);

    if (currentGroup) {
      currentGroup.slots.push(slot);
      continue;
    }

    groups.set(key, {
      key,
      appointmentDate: slot.appointmentDate,
      dayNumber: new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(new Date(slot.appointmentDate)),
      weekdayLabel: new Intl.DateTimeFormat("ar-SA", { weekday: "short" }).format(new Date(slot.appointmentDate)),
      monthLabel: new Intl.DateTimeFormat("ar-SA", { month: "short" }).format(new Date(slot.appointmentDate)),
      slots: [slot]
    });
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    slots: group.slots.sort(
      (left, right) => new Date(left.appointmentDate).getTime() - new Date(right.appointmentDate).getTime()
    )
  }));
}

function formatSelectedAppointment(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatSlotTime(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDateKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
}

function createStyles(patientPalette: PatientPalette) {
  return StyleSheet.create({
    sectionHint: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_500Medium",
      textAlign: "right",
      lineHeight: 24,
      marginTop: 4
    },
    dayGrid: {
      flexDirection: "row-reverse",
      gap: 8,
      paddingHorizontal: 2
    },
    dayScroll: {
      marginTop: 14
    },
    timeGrid: {
      flexDirection: "row-reverse",
      gap: 10,
      flexWrap: "wrap",
      marginTop: 16
    },
    chipPressed: {
      opacity: 0.84
    },
    dayChip: {
      width: 62,
      minHeight: 74,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: patientPalette.line,
      backgroundColor: patientPalette.panelSoft,
      paddingHorizontal: 8,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      gap: 3
    },
    dayChipSelected: {
      backgroundColor: patientPalette.primarySoft,
      borderColor: patientPalette.primary
    },
    dayNumber: {
      color: patientPalette.text,
      fontFamily: "Cairo_700Bold",
      fontSize: 18,
      lineHeight: 24
    },
    dayTextSelected: {
      color: patientPalette.primary
    },
    dayMeta: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_600SemiBold",
      fontSize: 10,
      textAlign: "center",
      lineHeight: 16
    },
    dayMetaSelected: {
      color: patientPalette.primaryStrong
    },
    timeChip: {
      minWidth: 104,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: patientPalette.line,
      backgroundColor: patientPalette.panelSoft,
      paddingHorizontal: 14,
      paddingVertical: 12,
      alignItems: "center"
    },
    timeChipSelected: {
      backgroundColor: patientPalette.primarySoft,
      borderColor: patientPalette.primary
    },
    timeText: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_700Bold",
      fontSize: 14
    },
    timeTextSelected: {
      color: patientPalette.primary
    },
    selectionBlock: {
      gap: 8,
      marginTop: 16
    },
    selectionLabel: {
      color: patientPalette.text,
      fontFamily: "Cairo_600SemiBold",
      fontSize: 14,
      textAlign: "right"
    },
    selectionCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: patientPalette.line,
      backgroundColor: patientPalette.panelSoft,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 6
    },
    selectionCardError: {
      borderColor: patientPalette.red
    },
    selectionValue: {
      color: patientPalette.text,
      fontFamily: "Cairo_700Bold",
      fontSize: 15,
      textAlign: "right",
      lineHeight: 28
    },
    selectionHint: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_500Medium",
      fontSize: 12,
      textAlign: "right"
    },
    errorText: {
      color: patientPalette.red,
      fontFamily: "Cairo_500Medium",
      fontSize: 12,
      textAlign: "right"
    }
  });
}
