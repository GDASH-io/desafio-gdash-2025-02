export function isDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  const date = new Date(dateString);

  return !isNaN(date.getTime());
}
