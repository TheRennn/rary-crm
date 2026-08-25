"use client";

import { forwardRef, useCallback, type ChangeEvent } from "react";
import { Input, type InputProps } from "@/components/ui/Input";
import { maskPhone, maskCpfCnpj, maskCnpj, maskCurrency } from "@/lib/utils";

export type MaskType = "phone" | "cpfCnpj" | "cnpj" | "currency";

export interface MaskedInputProps extends Omit<InputProps, "onChange"> {
  mask: MaskType;
  onChange?: (value: string) => void;
}

const maskFunctions: Record<MaskType, (v: string) => string> = {
  phone: maskPhone,
  cpfCnpj: maskCpfCnpj,
  cnpj: maskCnpj,
  currency: maskCurrency,
};

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onChange, value, ...props }, ref) => {
    const applyMask = maskFunctions[mask];

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const masked = applyMask(raw);
        onChange?.(masked);
      },
      [applyMask, onChange]
    );

    return (
      <Input
        ref={ref}
        value={typeof value === "string" ? applyMask(value) : value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";
