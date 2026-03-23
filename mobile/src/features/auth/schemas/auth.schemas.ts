import { z } from "zod";

const passwordField = z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل");
const confirmPasswordField = z.string().min(8, "أدخل تأكيد كلمة المرور");

function withPasswordConfirmation<T extends z.ZodRawShape>(shape: T) {
  return z
    .object({
      ...shape,
      password: passwordField,
      confirmPassword: confirmPasswordField
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: "كلمتا المرور غير متطابقتين",
      path: ["confirmPassword"]
    });
}

export const loginSchema = z.object({
  email: z.string().email("أدخل بريدًا إلكترونيًا صحيحًا"),
  password: passwordField
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("أدخل بريدًا إلكترونيًا صحيحًا")
});

export const verifyOtpSchema = z.object({
  code: z
    .string()
    .min(4, "أدخل رمز التحقق كاملًا")
    .max(4, "رمز التحقق يجب أن يكون من 4 أرقام")
});

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: confirmPasswordField
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"]
  });

export const patientRegistrationSchema = withPasswordConfirmation({
  fullName: z.string().min(3, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string().min(4, "تاريخ الميلاد مطلوب"),
  city: z.string().optional(),
  region: z.string().optional()
});

export const doctorRegistrationSchema = withPasswordConfirmation({
  fullName: z.string().min(3, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  specialization: z.string().min(2, "التخصص مطلوب"),
  city: z.string().optional(),
  region: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0),
  bio: z.string().min(10, "الوصف المهني قصير"),
  licenseNumber: z.string().min(5, "رقم الترخيص غير كاف"),
  consultationFee: z.coerce.number().optional(),
  supportsOnline: z.boolean().default(true),
  supportsInPerson: z.boolean().default(true)
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type PatientRegistrationValues = z.infer<typeof patientRegistrationSchema>;
export type DoctorRegistrationValues = z.infer<typeof doctorRegistrationSchema>;
