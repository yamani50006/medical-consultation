import { z } from "zod";

function optionalTextSchema(label: string, maximum: number, minimum = 0) {
  return z
    .string()
    .trim()
    .max(maximum, `${label} يجب أن يكون أقل من ${maximum} حرف`)
    .refine((value) => value.length === 0 || value.length >= minimum, {
      message: minimum > 0 ? `${label} يجب أن يكون ${minimum} أحرف على الأقل` : `${label} غير صالح`
    });
}

export const patientProfileSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم الكامل مطلوب").max(120, "الاسم طويل جداً"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || /^\d{4}-\d{2}-\d{2}$/.test(value), "اكتب تاريخ الميلاد بصيغة YYYY-MM-DD")
    .refine(
      (value) => value.length === 0 || !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()),
      "تاريخ الميلاد غير صالح"
    )
    .refine(
      (value) => value.length === 0 || new Date(`${value}T00:00:00.000Z`).getTime() <= Date.now(),
      "تاريخ الميلاد يجب أن يكون في الماضي"
    ),
  city: optionalTextSchema("المدينة", 120, 2),
  region: optionalTextSchema("المنطقة", 120, 2),
  bloodType: optionalTextSchema("فصيلة الدم", 10),
  chronicDiseases: optionalTextSchema("الأمراض المزمنة", 500),
  currentMedications: optionalTextSchema("الأدوية الحالية", 500),
  profileImageUrl: z.string().max(3_000_000).nullable().optional()
});

export type PatientProfileFormValues = z.infer<typeof patientProfileSchema>;
