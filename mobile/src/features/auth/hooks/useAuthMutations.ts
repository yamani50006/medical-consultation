import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { appContainer } from "@/app/di/container";
import {
  doctorRegistrationSchema,
  DoctorRegistrationValues,
  loginSchema,
  LoginFormValues,
  patientRegistrationSchema,
  PatientRegistrationValues
} from "@/features/auth/schemas/auth.schemas";
import { sessionManager } from "@/store/auth/session.manager";
import { useUiStore } from "@/store/ui/ui.store";

export function useLoginForm() {
  return useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });
}

export function usePatientRegisterForm() {
  return useForm<PatientRegistrationValues>({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: { fullName: "", email: "", password: "", gender: "male", dateOfBirth: "", city: "", region: "" }
  });
}

export function useDoctorRegisterForm() {
  return useForm<DoctorRegistrationValues>({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      specialization: "",
      city: "",
      region: "",
      yearsOfExperience: 0,
      bio: "",
      licenseNumber: "",
      consultationFee: 0,
      supportsOnline: true,
      supportsInPerson: true
    }
  });
}

export function useLoginMutation() {
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: (payload: LoginFormValues) => appContainer.useCases.login.execute(payload),
    onSuccess: async (session) => {
      await sessionManager.start(session);
      showToast({ title: "تم تسجيل الدخول", description: "مرحبًا بعودتك" });
    }
  });
}

export function useRegisterPatientMutation() {
  const showToast = useUiStore((state) => state.showToast);
  return useMutation({
    mutationFn: (payload: PatientRegistrationValues) => appContainer.repositories.auth.registerPatient(payload),
    onSuccess: async (session) => {
      await sessionManager.start(session);
      showToast({ title: "تم إنشاء الحساب", description: "أصبح حسابك جاهزًا للاستخدام" });
    }
  });
}

export function useRegisterDoctorMutation() {
  const showToast = useUiStore((state) => state.showToast);
  return useMutation({
    mutationFn: (payload: DoctorRegistrationValues) => appContainer.repositories.auth.registerDoctor(payload),
    onSuccess: () => {
      showToast({ title: "تم إرسال طلب التسجيل", description: "سيتم تفعيل حساب الطبيب بعد المراجعة" });
    }
  });
}
