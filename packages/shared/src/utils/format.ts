export function formatDate(date: string | Date, locale = 'pt-BR'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatTemperature(value: number): string {
  return `${value.toFixed(1)}°C`
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(0)}%`
}

export function formatWindSpeed(value: number): string {
  return `${value.toFixed(1)} km/h`
}
