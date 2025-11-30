import { cn } from "@/app/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface SelectOptionsProps {
  placeholder?: string;
  options: { value: string; label: string }[];
  setOptions: (days: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SelectOptions({ placeholder, options, setOptions, disabled = false, className }: SelectOptionsProps) {
  return (
    <Select onValueChange={setOptions} disabled={disabled}>
      <SelectTrigger className={cn("w-fit max-w-[200px] text-white text-sm", className)}>
        <SelectValue placeholder={placeholder || "Selecione"}/>
      </SelectTrigger>
      <SelectContent className="w-full">
        {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}
