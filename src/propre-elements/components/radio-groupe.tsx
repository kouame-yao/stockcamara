import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RadioOption {
  value: string;
  label: string;
  id: string;
}

interface RadioGroupDemoProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  className?: string;
  label?: string;
}

export function RadioGroupDemo({
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  className,
  label,
}: RadioGroupDemoProps) {
  return (
    <div className={className}>
      {label && (
        <label className="font-medium text-sm mb-2 block">{label}</label>
      )}
      <RadioGroup
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        name={name}
      >
        {options?.map((option) => (
          <div key={option.id} className="flex items-center gap-3">
            <RadioGroupItem value={option.value} id={option.id} />
            <Label htmlFor={option.id}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
