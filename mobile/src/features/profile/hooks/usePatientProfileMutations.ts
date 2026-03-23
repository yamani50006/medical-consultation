import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { FieldNamesMarkedBoolean, useForm } from "react-hook-form";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";
import { PatientProfileEntity } from "@/domain/entities/PatientProfile";
import { UpdatePatientProfilePayload } from "@/domain/repositories/PatientRepository";
import { PatientProfileFormValues, patientProfileSchema } from "@/features/profile/schemas/profile.schemas";
import { queryClient } from "@/shared/utils/query-client";
import { useAuthStore } from "@/store/auth/auth.store";
import { useUiStore } from "@/store/ui/ui.store";

const EMPTY_FORM_VALUES: PatientProfileFormValues = {
  fullName: "",
  gender: "male",
  dateOfBirth: "",
  city: "",
  region: "",
  bloodType: "",
  chronicDiseases: "",
  currentMedications: "",
  profileImageUrl: null
};

export function usePatientProfileForm(profile?: PatientProfileEntity | null) {
  const form = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    mode: "onChange",
    defaultValues: EMPTY_FORM_VALUES
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    form.reset(mapPatientProfileToFormValues(profile));
  }, [form, profile]);

  return form;
}

export function useUpdatePatientProfileMutation() {
  const showToast = useUiStore((state) => state.showToast);
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (payload: UpdatePatientProfilePayload) => appContainer.useCases.updateMyProfile.execute(payload),
    onSuccess: async (profile, payload) => {
      const nextProfile = mergePatientProfileUpdate(profile, payload);

      updateUser(nextProfile.user);
      queryClient.setQueryData(appQueryKeys.patientProfile(), nextProfile);
      await queryClient.invalidateQueries({ queryKey: appQueryKeys.patientProfile() });
      showToast({ title: "تم حفظ الملف", description: "تم تحديث الاسم والصورة والبيانات الطبية بنجاح." });
    },
    onError: (error) => {
      showToast({
        title: "تعذر حفظ التعديلات",
        description: getPatientProfileUpdateErrorMessage(error)
      });
    }
  });
}

export function mapPatientProfileToFormValues(profile: PatientProfileEntity): PatientProfileFormValues {
  return {
    fullName: profile.user.fullName ?? "",
    gender: profile.gender,
    dateOfBirth: toDateInputValue(profile.dateOfBirth),
    city: profile.city ?? "",
    region: profile.region ?? "",
    bloodType: profile.bloodType ?? "",
    chronicDiseases: profile.chronicDiseases ?? "",
    currentMedications: profile.currentMedications ?? "",
    profileImageUrl: profile.user.profileImageUrl ?? null
  };
}

export function mapPatientProfileFormValuesToPayload(
  values: PatientProfileFormValues,
  dirtyFields?: Partial<FieldNamesMarkedBoolean<PatientProfileFormValues>>
): UpdatePatientProfilePayload {
  const payload: UpdatePatientProfilePayload = {};

  if (dirtyFields?.fullName) {
    payload.fullName = normalizeRequiredText(values.fullName);
  }

  if (dirtyFields?.profileImageUrl) {
    payload.profileImageUrl = values.profileImageUrl ?? null;
  }

  if (dirtyFields?.gender) {
    payload.gender = values.gender;
  }

  if (dirtyFields?.dateOfBirth) {
    payload.dateOfBirth = normalizeOptionalDate(values.dateOfBirth);
  }

  if (dirtyFields?.city) {
    payload.city = normalizeOptionalText(values.city);
  }

  if (dirtyFields?.region) {
    payload.region = normalizeOptionalText(values.region);
  }

  if (dirtyFields?.bloodType) {
    payload.bloodType = normalizeOptionalText(values.bloodType);
  }

  if (dirtyFields?.chronicDiseases) {
    payload.chronicDiseases = normalizeOptionalText(values.chronicDiseases);
  }

  if (dirtyFields?.currentMedications) {
    payload.currentMedications = normalizeOptionalText(values.currentMedications);
  }

  return payload;
}

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function normalizeOptionalText(value?: string | null) {
  const normalizedValue = value?.trim() ?? "";
  return normalizedValue ? normalizedValue : null;
}

function normalizeRequiredText(value?: string | null) {
  return value?.trim() ?? "";
}

function normalizeOptionalDate(value?: string | null) {
  const normalizedValue = value?.trim() ?? "";
  return normalizedValue ? normalizedValue : undefined;
}

function mergePatientProfileUpdate(profile: PatientProfileEntity, payload: UpdatePatientProfilePayload): PatientProfileEntity {
  return {
    ...profile,
    gender: payload.gender ?? profile.gender,
    dateOfBirth: payload.dateOfBirth ?? profile.dateOfBirth,
    city: hasOwn(payload, "city") ? payload.city ?? null : profile.city,
    region: hasOwn(payload, "region") ? payload.region ?? null : profile.region,
    bloodType: hasOwn(payload, "bloodType") ? payload.bloodType ?? null : profile.bloodType,
    chronicDiseases: hasOwn(payload, "chronicDiseases") ? payload.chronicDiseases ?? null : profile.chronicDiseases,
    currentMedications: hasOwn(payload, "currentMedications")
      ? payload.currentMedications ?? null
      : profile.currentMedications,
    user: {
      ...profile.user,
      fullName: payload.fullName ?? profile.user.fullName,
      profileImageUrl: hasOwn(payload, "profileImageUrl") ? payload.profileImageUrl ?? null : profile.user.profileImageUrl
    }
  };
}

function hasOwn<T extends object>(value: T, key: keyof T) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function getPatientProfileUpdateErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return "تحقق من البيانات المدخلة ثم أعد المحاولة.";
  }

  const responseData = error.response?.data as
    | {
        message?: string;
        errors?: {
          fieldErrors?: Record<string, string[] | undefined>;
        };
      }
    | undefined;

  const firstFieldError = responseData?.errors?.fieldErrors
    ? Object.values(responseData.errors.fieldErrors)
        .flat()
        .find((message): message is string => Boolean(message))
    : null;

  if (firstFieldError === "Expected string, received null" || firstFieldError === "Invalid input: expected string, received null") {
    return "يوجد حقل نصي فارغ أو غير صالح في البيانات المرسلة. حدّث التطبيق ثم أعد المحاولة.";
  }

  return firstFieldError || responseData?.message || "تحقق من البيانات المدخلة ثم أعد المحاولة.";
}
