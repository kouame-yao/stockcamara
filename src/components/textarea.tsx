"use client";
import { Textarea } from "@/components/ui/textarea";
import { ChangeEvent } from "react";

interface TextareaDemoProps {
  className?: string;
  placeholder?: string;
  value?: string;
  name?: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number; // nombre de lignes
}

export function TextareaDemo({
  className,
  placeholder,
  value,
  name,
  onChange,
  disabled = false,
  readonly = false,
  rows = 4,
}: TextareaDemoProps) {
  return (
    <Textarea
      name={name}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      readOnly={readonly}
      rows={rows}
    />
  );
}
