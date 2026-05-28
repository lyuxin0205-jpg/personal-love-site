export function daysBetween(startDate: string, end = new Date()) {
  const start = new Date(`${startDate}T00:00:00`);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

export function daysUntil(date: string) {
  const today = new Date();
  const target = new Date(`${date}T00:00:00`);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}
