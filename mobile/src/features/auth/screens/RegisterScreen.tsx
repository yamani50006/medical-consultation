import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";

import { UserRole } from "@/core/enums/user-role";
import { useDoctorRegisterForm, usePatientRegisterForm, useRegisterDoctorMutation, useRegisterPatientMutation } from "@/features/auth";
import { AuthStackParamList } from "@/navigation/types";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { InputField } from "@/shared/components/InputField";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { Screen } from "@/shared/components/Screen";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ route }: Props) {
  const { theme } = useAppTheme();
  const role = route.params?.role ?? UserRole.Patient;
  const patientForm = usePatientRegisterForm();
  const doctorForm = useDoctorRegisterForm();
  const registerPatient = useRegisterPatientMutation();
  const registerDoctor = useRegisterDoctorMutation();

  return (
    <Screen>
      <ScreenHeader
        title={role === UserRole.Patient ? "إنشاء حساب مريض" : "تسجيل طبيب"}
        subtitle={role === UserRole.Patient ? "أدخل بياناتك الأساسية لبدء الاستخدام" : "أرسل طلب الانضمام كطبيب"}
      />
      {role === UserRole.Patient ? (
        <Card style={{ borderRadius: 32 }}>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text style={{ color: theme.colors.text.primary, fontFamily: "Cairo_700Bold", fontSize: 22 }}>بيانات الحساب</Text>
          </View>
          <InputField control={patientForm.control} name="fullName" label="الاسم الكامل" />
          <InputField control={patientForm.control} name="email" label="البريد الإلكتروني" />
          <PasswordInput control={patientForm.control} name="password" label="كلمة المرور" />
          <InputField control={patientForm.control} name="dateOfBirth" label="تاريخ الميلاد" placeholder="1998-05-10" />
          <Button title="إنشاء حساب مريض" loading={registerPatient.isPending} onPress={patientForm.handleSubmit((values) => registerPatient.mutate(values))} />
        </Card>
      ) : (
        <Card style={{ borderRadius: 32 }}>
          <InputField control={doctorForm.control} name="fullName" label="الاسم الكامل" />
          <InputField control={doctorForm.control} name="email" label="البريد الإلكتروني" />
          <PasswordInput control={doctorForm.control} name="password" label="كلمة المرور" />
          <InputField control={doctorForm.control} name="specialization" label="التخصص" />
          <InputField control={doctorForm.control} name="yearsOfExperience" label="سنوات الخبرة" />
          <InputField control={doctorForm.control} name="bio" label="نبذة مهنية" multiline />
          <InputField control={doctorForm.control} name="licenseNumber" label="رقم الترخيص" />
          <Button title="إرسال طلب التسجيل كطبيب" loading={registerDoctor.isPending} onPress={doctorForm.handleSubmit((values) => registerDoctor.mutate(values))} />
        </Card>
      )}
    </Screen>
  );
}
