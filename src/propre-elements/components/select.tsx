"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectDemoProps<T> {
  data: T[];
  labelKey?: keyof T | ((item: T) => string);
  valueKey?: keyof T;
  label?: string;
  placeholder?: string;
  className?: string;
  name?: string;
  value?: string; // ✅ CORRECTION : Seulement string (pas boolean)
  onChange?: (name: string, value: string, item?: T) => void;
  disabled?: boolean; // ✅ CORRECTION : Seulement boolean (pas string ni fonction)
}

export function SelectDemo<T extends Record<string, any>>({
  data,
  labelKey,
  valueKey,
  label = "Sélectionnez",
  placeholder = "Choisissez une option",
  className,
  name,
  value,
  onChange,
  disabled = false, // ✅ Valeur par défaut
}: SelectDemoProps<T>) {
  const sample = data?.[0];
  const autoLabelKey =
    typeof labelKey === "string"
      ? labelKey
      : sample
      ? (Object.keys(sample)[1] as keyof T)
      : undefined;

  const autoValueKey =
    valueKey || (sample ? (Object.keys(sample)[0] as keyof T) : undefined);

  const getLabel = (item: T): string => {
    if (typeof labelKey === "function") return labelKey(item);
    if (autoLabelKey && item[autoLabelKey] !== undefined)
      return String(item[autoLabelKey]);
    return "—";
  };

  return (
    <Select
      disabled={disabled} // ✅ Type correct : boolean
      value={value} // ✅ Type correct : string | undefined
      onValueChange={(v) => {
        const item = data.find((d) => String(d[autoValueKey!]) === String(v));
        onChange?.(name || "", v, item);
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {data?.map((item, i) => (
            <SelectItem key={i} value={String(item[autoValueKey!])}>
              {getLabel(item)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
