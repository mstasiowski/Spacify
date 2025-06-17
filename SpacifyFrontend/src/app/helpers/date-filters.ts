export function excludeWeekendsFilter(date: Date | null): boolean {
  const day = (date || new Date()).getDay();
  return day !== 0 && day !== 6;
}
