"use client";
import { Input } from "@/components/ui/input";
import { ChangeEvent } from "react";

interface InputDemoProps {
  type?: string;
  placeholder?: string;
  className?: string;
  value?: string | number;
  name?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void; // Corrigé: accepte l'événement complet
  disabled?: string | boolean | (() => boolean | string);
}

export function InputDemo({
  type = "text",
  placeholder,
  className,
  value,
  name,
  onChange,
  disabled,
}: InputDemoProps) {
  const isDisabledRaw = typeof disabled === "function" ? disabled() : disabled;
  const isDisabled = Boolean(isDisabledRaw);
  return (
    <Input
      disabled={isDisabled}
      required
      type={type}
      placeholder={placeholder}
      className={className}
      value={value}
      name={name}
      onChange={onChange} // Corrigé: passe directement l'événement
    />
  );
}
