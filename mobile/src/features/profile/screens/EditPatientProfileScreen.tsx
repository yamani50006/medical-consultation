import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { ReactNode } from "react";
import { Control, Controller, Path } from "react-hook-form";
import {
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { PatientPalette, usePatientPalette } from "@/features/home/components/patient-theme";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import {
  mapPatientProfileFormValuesToPayload,
  usePatientProfileForm,
  useUpdatePatientProfileMutation
} from "@/features/profile/hooks/usePatientProfileMutations";
import { usePatientProfileQuery } from "@/features/profile/hooks/usePatientProfileQuery";
import { PatientProfileFormValues } from "@/features/profile/schemas/profile.schemas";
import { Button } from "@/shared/components/Button";
import { Avatar } from "@/shared/components/Avatar";
import { ErrorState } from "@/shared/components/ErrorState";
import { Loader } from "@/shared/components/Loader";
import { useUiStore } from "@/store/ui/ui.store";

const GENDER_OPTIONS = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
  { value: "other", label: "أخرى" }
] as const;

const PROFILE_IMAGE_MAX_LENGTH = 3_000_000;

export function EditPatientProfileScreen() {
  const navigation = useNavigation<any>();
  const patientPalette = usePatientPalette();
  const showToast = useUiStore((state) => state.showToast);
  const profileQuery = usePatientProfileQuery();
  const updateProfile = useUpdatePatientProfileMutation();
  const form = usePatientProfileForm(profileQuery.data);
  const selectedGender = form.watch("gender");
  const profileImageUrl = form.watch("profileImageUrl");
  const fullName = form.watch("fullName");
  const {
    formState: { dirtyFields, isDirty, isValid }
  } = form;

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast({
        title: "الصلاحية مطلوبة",
        description: "اسمح للتطبيق بالوصول للصور حتى تتمكن من تحديث صورة البروفايل."
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (!asset?.base64) {
      showToast({
        title: "تعذر قراءة الصورة",
        description: "أعد المحاولة بصورة أخرى أو بحجم أصغر."
      });
      return;
    }

    const dataUrl = `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`;
    if (dataUrl.length > PROFILE_IMAGE_MAX_LENGTH) {
      showToast({
        title: "الصورة كبيرة",
        description: "اختر صورة أصغر قليلاً حتى يمكن حفظها داخل الملف الشخصي."
      });
      return;
    }

    form.setValue("profileImageUrl", dataUrl, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  const handleRemoveImage = () => {
    form.setValue("profileImageUrl", null, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync(mapPatientProfileFormValuesToPayload(values, dirtyFields));
      navigation.goBack();
    } catch {
      return;
    }
  });

  if (profileQuery.isLoading && !profileQuery.data) {
    return (
      <PatientScreen>
        <Loader />
      </PatientScreen>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <PatientScreen>
        <ErrorState message="تعذر تحميل بيانات الملف للتعديل" onRetry={profileQuery.refetch} />
      </PatientScreen>
    );
  }

  return (
    <PatientScreen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.stack}>
          <View style={styles.topBar}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={[styles.iconButton, { backgroundColor: patientPalette.panel, borderColor: patientPalette.line }]}
            >
              <Ionicons name="arrow-forward" size={18} color={patientPalette.text} />
            </Pressable>
            <View style={styles.titleBlock}>
              <Text style={[styles.title, { color: patientPalette.text }]}>تعديل الملف الشخصي</Text>
              <Text style={[styles.subtitle, { color: patientPalette.textMuted }]}>
                عدّل الاسم والصورة وبياناتك الطبية من مكان واحد.
              </Text>
            </View>
          </View>

          <View style={[styles.heroCard, { backgroundColor: patientPalette.panel, borderColor: patientPalette.line, shadowColor: patientPalette.shadow }]}>
            <View style={[styles.avatarRing, { borderColor: patientPalette.primary }]}>
              <Avatar
                name={fullName || profileQuery.data.user.fullName}
                imageUrl={profileImageUrl}
                size={96}
                backgroundColor={patientPalette.primarySoft}
                textColor={patientPalette.primary}
              />
            </View>
            <Text style={[styles.heroName, { color: patientPalette.text }]} numberOfLines={1}>
              {fullName || "اسم المريض"}
            </Text>
            <Text style={[styles.heroHint, { color: patientPalette.textMuted }]}>
              الصورة الجديدة تنعكس مباشرة في الرئيسية وحسابي بعد الحفظ.
            </Text>
            <View style={styles.heroActions}>
              <Pressable
                onPress={handlePickImage}
                style={[styles.heroActionButton, { backgroundColor: patientPalette.primarySoft, borderColor: patientPalette.primary }]}
              >
                <Ionicons name="image-outline" size={16} color={patientPalette.primary} />
                <Text style={[styles.heroActionText, { color: patientPalette.primary }]}>اختيار صورة</Text>
              </Pressable>
              <Pressable
                onPress={handleRemoveImage}
                disabled={!profileImageUrl}
                style={[
                  styles.heroActionButton,
                  {
                    backgroundColor: patientPalette.panelSoft,
                    borderColor: patientPalette.line,
                    opacity: profileImageUrl ? 1 : 0.5
                  }
                ]}
              >
                <Ionicons name="trash-outline" size={16} color={patientPalette.textMuted} />
                <Text style={[styles.heroActionText, { color: patientPalette.textMuted }]}>إزالة الصورة</Text>
              </Pressable>
            </View>
          </View>

          <FormSection
            title="بيانات الحساب"
            description="هذه البيانات تظهر في ملفك الشخصي وواجهة التطبيق المرتبطة بالحساب."
            palette={patientPalette}
          >
            <ProfileTextField control={form.control} name="fullName" label="الاسم الكامل" palette={patientPalette} />
            <View style={styles.genderBlock}>
              <Text style={[styles.fieldLabel, { color: patientPalette.text }]}>الجنس</Text>
              <View style={styles.genderRow}>
                {GENDER_OPTIONS.map((option) => {
                  const selected = selectedGender === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => form.setValue("gender", option.value, { shouldDirty: true, shouldValidate: true })}
                      style={[
                        styles.genderChip,
                        {
                          backgroundColor: selected ? patientPalette.primarySoft : patientPalette.panelSoft,
                          borderColor: selected ? patientPalette.primary : patientPalette.line
                        }
                      ]}
                    >
                      <Text style={[styles.genderChipText, { color: selected ? patientPalette.primary : patientPalette.textMuted }]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <ProfileTextField
              control={form.control}
              name="dateOfBirth"
              label="تاريخ الميلاد"
              placeholder="YYYY-MM-DD"
              palette={patientPalette}
              keyboardType="numbers-and-punctuation"
            />
          </FormSection>

          <FormSection
            title="البيانات الطبية"
            description="تُستخدم هذه البيانات في السجل الطبي والحجوزات والاستشارات."
            palette={patientPalette}
          >
            <ProfileTextField control={form.control} name="city" label="المدينة" palette={patientPalette} />
            <ProfileTextField control={form.control} name="region" label="المنطقة" palette={patientPalette} />
            <ProfileTextField control={form.control} name="bloodType" label="فصيلة الدم" palette={patientPalette} />
            <ProfileTextField
              control={form.control}
              name="chronicDiseases"
              label="الأمراض المزمنة"
              placeholder="مثال: ضغط، سكر"
              palette={patientPalette}
              multiline
            />
            <ProfileTextField
              control={form.control}
              name="currentMedications"
              label="الأدوية الحالية"
              placeholder="أدخل الأدوية التي تستخدمها حالياً"
              palette={patientPalette}
              multiline
            />
          </FormSection>

          <Button
            title={isDirty ? "حفظ التعديلات" : "لا توجد تعديلات للحفظ"}
            onPress={handleSubmit}
            loading={updateProfile.isPending}
            disabled={!isDirty || !isValid}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>
    </PatientScreen>
  );
}

function FormSection({
  title,
  description,
  palette,
  children
}: {
  title: string;
  description: string;
  palette: PatientPalette;
  children: ReactNode;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: palette.panel, borderColor: palette.line }]}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.sectionDescription, { color: palette.textMuted }]}>{description}</Text>
      <View style={styles.fieldsStack}>{children}</View>
    </View>
  );
}

function ProfileTextField({
  control,
  name,
  label,
  palette,
  placeholder,
  multiline,
  keyboardType
}: {
  control: Control<PatientProfileFormValues>;
  name: Path<PatientProfileFormValues>;
  label: string;
  palette: PatientPalette;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLabel, { color: palette.text }]}>{label}</Text>
          <TextInput
            value={value === null || value === undefined ? "" : String(value)}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={palette.textMuted}
            keyboardType={keyboardType}
            multiline={multiline}
            style={[
              styles.input,
              {
                minHeight: multiline ? 112 : 54,
                backgroundColor: palette.panelSoft,
                borderColor: error ? palette.red : palette.line,
                color: palette.text
              }
            ]}
            textAlign="right"
            textAlignVertical={multiline ? "top" : "center"}
          />
          {error ? <Text style={[styles.errorText, { color: palette.red }]}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16
  },
  topBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  titleBlock: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  title: {
    fontFamily: "Cairo_700Bold",
    fontSize: 26,
    textAlign: "right"
  },
  subtitle: {
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    textAlign: "right",
    lineHeight: 22
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
    gap: 10,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8
  },
  avatarRing: {
    padding: 6,
    borderWidth: 2,
    borderRadius: 999
  },
  heroName: {
    fontFamily: "Cairo_700Bold",
    fontSize: 24
  },
  heroHint: {
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 22
  },
  heroActions: {
    width: "100%",
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 4
  },
  heroActionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  heroActionText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 14
  },
  sectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12
  },
  sectionTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    textAlign: "right"
  },
  sectionDescription: {
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    textAlign: "right",
    lineHeight: 22
  },
  fieldsStack: {
    gap: 14
  },
  fieldWrap: {
    gap: 8
  },
  fieldLabel: {
    fontFamily: "Cairo_700Bold",
    fontSize: 14,
    textAlign: "right"
  },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "Cairo_500Medium",
    fontSize: 15
  },
  errorText: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    textAlign: "right"
  },
  genderBlock: {
    gap: 10
  },
  genderRow: {
    flexDirection: "row-reverse",
    gap: 10
  },
  genderChip: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  genderChipText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 14
  },
  submitButton: {
    marginTop: 4,
    marginBottom: 12
  }
});
