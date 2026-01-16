"use client";

import * as React from "react";
import PhoneInputControl from "react-phone-number-input/react-hook-form";
import type E164Number from "react-phone-number-input";
import type CountryCode from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Control, FieldValues, Path } from "react-hook-form";

interface PhoneInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  className?: string;
}

export const PhoneInput = <T extends FieldValues>({
  name,
  control,
  className,
}: PhoneInputProps<T>) => {
  return (
    <PhoneInputControl
      name={name}
      control={control}
      className={cn("flex", className)}
      inputComponent={Input}
      defaultCountry="BR"
      international
      withCountryCallingCode
      limitMaxLength
    />
  );
};
