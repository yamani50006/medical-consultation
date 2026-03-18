import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("أدخل بريدًا إلكترونيًا صحيحًا"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
});

export const patientRegistrationSchema = z.object({
  fullName: z.string().min(3, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(8, "كلمة المرور قصيرة"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string().min(4, "تاريخ الميلاد مطلوب"),
  city: z.string().optional(),
  region: z.string().optional()
});

export const doctorRegistrationSchema = z.object({
  fullName: z.string().min(3, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(8, "كلمة المرور قصيرة"),
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
export type PatientRegistrationValues = z.infer<typeof patientRegistrationSchema>;
export type DoctorRegistrationValues = z.infer<typeof doctorRegistrationSchema>;

