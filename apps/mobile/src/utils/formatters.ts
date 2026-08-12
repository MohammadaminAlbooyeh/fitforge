export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return '—';
  return `${kg} kg`;
}

export function formatCalories(n: number): string {
  return `${Math.round(n)} kcal`;
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}