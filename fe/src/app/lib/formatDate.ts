type DateFormatOptions = {
  date?: Date;
  onlyDate?: boolean;
  onlyHour?: boolean;
};

export function formatDate({
  date,
  onlyDate = false,
  onlyHour = false,
}: DateFormatOptions): string {
  return Intl.DateTimeFormat('pt-BR', {
    ...((onlyDate || !onlyHour) && {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    ...((!onlyDate || onlyHour) && {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }).format(date ?? new Date());
}
