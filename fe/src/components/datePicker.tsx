import { formatDate } from "@/app/lib/formatDate";

interface DatePickerProps {
  date?: Date;
  setDate: (date: Date) => void;
}

export function DatePicker({ date, setDate }: DatePickerProps) {

  return (
    <input
      type="date"
      className="[&::-webkit-calendar-picker-indicator]:cursor-pointer 
             [&::-webkit-calendar-picker-indicator]:opacity-50 
             hover:[&::-webkit-calendar-picker-indicator]:opacity-100
             [&::-webkit-calendar-picker-indicator]:invert-[0.5] text-sm md:text-base rounded-md outline-none bg-gray-100 border px-2 py-1"
      defaultValue={date ? formatDate({ date, onlyDate: true }) : undefined}
      onChange={(e) => {
        const [year, month, day] = e.target.value.split('-');
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        setDate(date)
      }}
    />
  );
}
