import { Control, FieldValues, Path } from "react-hook-form";

import { InputField } from "@/shared/components/InputField";

export function PasswordInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
}) {
  return <InputField control={control} name={name} label={label} placeholder={placeholder} secureTextEntry />;
}
