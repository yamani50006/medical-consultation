import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { APP_NAME } from "@/core/constants/app";
import { UserRole } from "@/core/enums/user-role";
import {
  AuthBrandMark,
  AuthButton,
  AuthDivider,
  AuthFooterMeta,
  AuthFormField,
  AuthPanel,
  AuthShell,
  AuthSocialButtons,
  authPalette
} from "@/features/auth/components";
import { useDoctorRegisterForm, usePatientRegisterForm, useRegisterDoctorMutation, useRegisterPatientMutation } from "@/features/auth/hooks/useAuthMutations";
import { AuthStackParamList } from "@/navigation/types";
import { useUiStore } from "@/store/ui/ui.store";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const patientGenderOptions = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
  { value: "other", label: "أخرى" }
] as const;

const roleOptions = [
  { value: UserRole.Patient, label: "مريض" },
  { value: UserRole.Doctor, label: "طبيب" }
] as const;

export function RegisterScreen({ navigation, route }: Props) {
  const initialRole = route.params?.role ?? UserRole.Patient;
  const [activeRole, setActiveRole] = useState<UserRole.Patient | UserRole.Doctor>(initialRole);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const patientForm = usePatientRegisterForm();
  const doctorForm = useDoctorRegisterForm();
  const registerPatient = useRegisterPatientMutation();
  const registerDoctor = useRegisterDoctorMutation();
  const showToast = useUiStore((state) => state.showToast);

  useEffect(() => {
    setActiveRole(route.params?.role ?? UserRole.Patient);
  }, [route.params?.role]);

  const doctorSupportsOnline = doctorForm.watch("supportsOnline");
  const doctorSupportsInPerson = doctorForm.watch("supportsInPerson");
  const patientGender = patientForm.watch("gender");

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.replace("Login");
  };

  const ensureTermsAccepted = () => {
    if (acceptedTerms) {
      return true;
    }

    showToast({
      title: "وافق على الشروط أولًا",
      description: "يلزم تأكيد الموافقة على الشروط وسياسة الخصوصية قبل إنشاء الحساب."
    });
    return false;
  };

  const handleSocialPress = (provider: "Google" | "Apple") => {
    showToast({
      title: `تسجيل ${provider} قريبًا`,
      description: "سيتم تفعيل مزوّدات التسجيل الاجتماعي في تحديث لاحق."
    });
  };

  const handlePatientSubmit = patientForm.handleSubmit((values) => {
    if (!ensureTermsAccepted()) {
      return;
    }

    registerPatient.mutate(values);
  });

  const handleDoctorSubmit = doctorForm.handleSubmit((values) => {
    if (!ensureTermsAccepted()) {
      return;
    }

    registerDoctor.mutate(values);
  });

  return (
    <AuthShell footer={<AuthFooterMeta />}>
      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 650 }}
        style={styles.hero}
      >
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>{APP_NAME}</Text>
            <AuthBrandMark size={44} icon="medical" />
          </View>

          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={authPalette.textMuted} />
          </Pressable>
        </View>

        <View style={styles.headlineBlock}>
          <Text style={styles.headline}>ابدأ رحلتك الصحية</Text>
          <Text style={styles.headlineSubtitle}>
            أنشئ حسابك ثم اختر المسار الذي يناسبك. يمكن التبديل بين وضع المريض والطبيب من نفس الشاشة.
          </Text>
        </View>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 120, type: "timing", duration: 650 }}>
        <AuthPanel style={styles.panel}>
          <View style={styles.segmentRow}>
            {roleOptions.map((option) => {
              const selected = option.value === activeRole;
              return (
                <Pressable key={option.value} onPress={() => setActiveRole(option.value)} style={[styles.segment, selected && styles.segmentActive]}>
                  <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{activeRole === UserRole.Patient ? "إنشاء حساب مريض" : "إرسال طلب طبيب"}</Text>
            <Text style={styles.sectionSubtitle}>
              {activeRole === UserRole.Patient
                ? "أدخل البيانات الأساسية لبدء الحجز وإدارة الاستشارات من واجهة واحدة."
                : "استكمل بياناتك المهنية الأساسية قبل إرسال طلب التسجيل للمراجعة."}
            </Text>
          </View>

          {activeRole === UserRole.Patient ? (
            <>
              <AuthFormField control={patientForm.control} name="fullName" label="الاسم الكامل" placeholder="أدخل اسمك الكامل" icon="person-outline" autoCapitalize="words" />
              <AuthFormField
                control={patientForm.control}
                name="email"
                label="البريد الإلكتروني"
                placeholder="example@health.com"
                icon="mail-outline"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              <AuthFormField
                control={patientForm.control}
                name="password"
                label="كلمة المرور"
                placeholder="********"
                icon="lock-closed-outline"
                secureTextEntry
                textContentType="newPassword"
              />
              <AuthFormField
                control={patientForm.control}
                name="confirmPassword"
                label="تأكيد كلمة المرور"
                placeholder="********"
                icon="shield-checkmark-outline"
                secureTextEntry
                textContentType="newPassword"
              />
              <AuthFormField
                control={patientForm.control}
                name="dateOfBirth"
                label="تاريخ الميلاد"
                placeholder="1998-05-10"
                icon="calendar-outline"
                autoCapitalize="none"
              />

              <View style={styles.group}>
                <Text style={styles.groupLabel}>الجنس</Text>
                <View style={styles.choiceRow}>
                  {patientGenderOptions.map((option) => {
                    const selected = option.value === patientGender;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => patientForm.setValue("gender", option.value, { shouldDirty: true, shouldValidate: true })}
                        style={[styles.choicePill, selected && styles.choicePillActive]}
                      >
                        <Text style={[styles.choiceText, selected && styles.choiceTextActive]}>{option.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.fieldRow}>
                <AuthFormField control={patientForm.control} name="city" label="المدينة" placeholder="عدن" icon="business-outline" autoCapitalize="words" containerStyle={styles.fieldHalf} />
                <AuthFormField control={patientForm.control} name="region" label="المنطقة" placeholder="كريتر" icon="location-outline" autoCapitalize="words" containerStyle={styles.fieldHalf} />
              </View>

            </>
          ) : (
            <>
              <AuthFormField control={doctorForm.control} name="fullName" label="الاسم الكامل" placeholder="الاسم كما يظهر في الملف الطبي" icon="person-outline" autoCapitalize="words" />
              <AuthFormField
                control={doctorForm.control}
                name="email"
                label="البريد الإلكتروني"
                placeholder="doctor@health.com"
                icon="mail-outline"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              <AuthFormField
                control={doctorForm.control}
                name="password"
                label="كلمة المرور"
                placeholder="********"
                icon="lock-closed-outline"
                secureTextEntry
                textContentType="newPassword"
              />
              <AuthFormField
                control={doctorForm.control}
                name="confirmPassword"
                label="تأكيد كلمة المرور"
                placeholder="********"
                icon="shield-checkmark-outline"
                secureTextEntry
                textContentType="newPassword"
              />
              <AuthFormField control={doctorForm.control} name="specialization" label="التخصص" placeholder="طب الأسرة" icon="medkit-outline" autoCapitalize="words" />

              <View style={styles.fieldRow}>
                <AuthFormField control={doctorForm.control} name="city" label="المدينة" placeholder="عدن" icon="business-outline" autoCapitalize="words" containerStyle={styles.fieldHalf} />
                <AuthFormField control={doctorForm.control} name="region" label="المنطقة" placeholder="المنصورة" icon="location-outline" autoCapitalize="words" containerStyle={styles.fieldHalf} />
              </View>

              <View style={styles.fieldRow}>
                <AuthFormField
                  control={doctorForm.control}
                  name="yearsOfExperience"
                  label="سنوات الخبرة"
                  placeholder="5"
                  icon="ribbon-outline"
                  keyboardType="number-pad"
                  inputMode="numeric"
                  description="رقم تقريبي."
                  containerStyle={styles.fieldHalf}
                />
                <AuthFormField
                  control={doctorForm.control}
                  name="consultationFee"
                  label="رسوم الاستشارة"
                  placeholder="150"
                  icon="cash-outline"
                  keyboardType="number-pad"
                  inputMode="numeric"
                  description="يمكن ترك 0."
                  containerStyle={styles.fieldHalf}
                />
              </View>

              <AuthFormField
                control={doctorForm.control}
                name="licenseNumber"
                label="رقم الترخيص"
                placeholder="LIC-2026-0012"
                icon="document-text-outline"
                autoCapitalize="characters"
              />
              <AuthFormField
                control={doctorForm.control}
                name="bio"
                label="نبذة مهنية"
                placeholder="عرّف عن خبرتك والاهتمامات السريرية بشكل مختصر."
                icon="document-text-outline"
                multiline
                autoCapitalize="sentences"
              />

              <View style={styles.group}>
                <Text style={styles.groupLabel}>أنماط الاستشارة</Text>
                <View style={styles.choiceRow}>
                  <ServiceToggle
                    label="أونلاين"
                    selected={doctorSupportsOnline}
                    icon="videocam-outline"
                    onPress={() => doctorForm.setValue("supportsOnline", !doctorSupportsOnline, { shouldDirty: true, shouldValidate: true })}
                  />
                  <ServiceToggle
                    label="حضوري"
                    selected={doctorSupportsInPerson}
                    icon="business-outline"
                    onPress={() => doctorForm.setValue("supportsInPerson", !doctorSupportsInPerson, { shouldDirty: true, shouldValidate: true })}
                  />
                </View>
              </View>
            </>
          )}

          <Pressable style={styles.termsRow} onPress={() => setAcceptedTerms((current) => !current)}>
            <View style={[styles.termsCheckbox, acceptedTerms && styles.termsCheckboxActive]}>
              {acceptedTerms ? <Ionicons name="checkmark" size={14} color={authPalette.black} /> : null}
            </View>
            <Text style={styles.termsText}>أوافق على شروط الخدمة وسياسة الخصوصية</Text>
          </Pressable>

          <AuthButton
            title={activeRole === UserRole.Patient ? "إنشاء حساب" : "إرسال طلب التسجيل"}
            icon={activeRole === UserRole.Patient ? "person-add-outline" : "paper-plane-outline"}
            loading={activeRole === UserRole.Patient ? registerPatient.isPending : registerDoctor.isPending}
            onPress={activeRole === UserRole.Patient ? handlePatientSubmit : handleDoctorSubmit}
          />

          <AuthDivider />
          <AuthSocialButtons
            onGooglePress={() => handleSocialPress("Google")}
            onApplePress={() => handleSocialPress("Apple")}
          />

          <View style={styles.loginRow}>
            <Pressable onPress={() => navigation.navigate("Login")} hitSlop={8}>
              <Text style={styles.loginLink}>تسجيل الدخول</Text>
            </Pressable>
            <Text style={styles.loginLabel}>لديك حساب بالفعل؟</Text>
          </View>
        </AuthPanel>
      </MotiView>
    </AuthShell>
  );
}

function ServiceToggle({
  label,
  selected,
  icon,
  onPress
}: {
  label: string;
  selected: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.choicePill, selected && styles.choicePillActive]}>
      <View style={styles.choiceContent}>
        <Ionicons name={icon} size={16} color={selected ? authPalette.black : authPalette.textMuted} />
        <Text style={[styles.choiceText, selected && styles.choiceTextActive]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 18
  },
  topBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between"
  },
  brandRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10
  },
  brandText: {
    color: authPalette.accentStrong,
    fontFamily: "Cairo_700Bold",
    fontSize: 26
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: authPalette.border,
    backgroundColor: authPalette.surfaceSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  headlineBlock: {
    alignItems: "flex-end",
    gap: 6
  },
  headline: {
    color: authPalette.accentStrong,
    fontFamily: "Cairo_700Bold",
    fontSize: 38,
    textAlign: "right"
  },
  headlineSubtitle: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 15,
    lineHeight: 26,
    textAlign: "right"
  },
  panel: {
    gap: 18
  },
  segmentRow: {
    flexDirection: "row-reverse",
    backgroundColor: authPalette.surfaceSoft,
    borderRadius: 20,
    padding: 4,
    gap: 6
  },
  segment: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentActive: {
    backgroundColor: authPalette.accent
  },
  segmentText: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_700Bold",
    fontSize: 14
  },
  segmentTextActive: {
    color: authPalette.black
  },
  sectionHeader: {
    alignItems: "flex-end",
    gap: 5
  },
  sectionTitle: {
    color: authPalette.text,
    fontFamily: "Cairo_700Bold",
    fontSize: 24
  },
  sectionSubtitle: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right"
  },
  fieldRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 12
  },
  fieldHalf: {
    flex: 1
  },
  group: {
    gap: 8
  },
  groupLabel: {
    color: authPalette.text,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    textAlign: "right"
  },
  choiceRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10
  },
  choicePill: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: authPalette.inputBorder,
    backgroundColor: authPalette.input,
    alignItems: "center",
    justifyContent: "center"
  },
  choicePillActive: {
    backgroundColor: authPalette.accent,
    borderColor: authPalette.accent
  },
  choiceContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8
  },
  choiceText: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13
  },
  choiceTextActive: {
    color: authPalette.black
  },
  termsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10
  },
  termsCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: authPalette.inputBorder,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center"
  },
  termsCheckboxActive: {
    borderColor: authPalette.accent,
    backgroundColor: authPalette.accent
  },
  termsText: {
    flex: 1,
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    textAlign: "right"
  },
  loginRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  loginLabel: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 13
  },
  loginLink: {
    color: authPalette.accentStrong,
    fontFamily: "Cairo_700Bold",
    fontSize: 14
  }
});
