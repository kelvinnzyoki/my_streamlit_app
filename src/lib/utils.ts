export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function imageUrl(src?: string): string {
  if (!src) return '/images/fit (1).webp';
  if (src.startsWith('http') || src.startsWith('/')) return src;
  const exerciseNames = [
    'boxjumps','burpees','buttkicks','childpose','crunches','downwarddog',
    'glutebridges','highknees','hipflexor','jumpingjacks','jumpsquats',
    'legraises','lunges','mountainclimbers','pikepushups','plank','pushups',
    'russiantwists','sprints','squats','tricepdips',
  ];
  const lower = src.toLowerCase();
  if (exerciseNames.some((n) => lower.includes(n))) return `/images/exercises/${src}`;
  return `/images/${src}`;
}

export function formatNumber(value?: number | string | null): string {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n.toLocaleString() : '0';
}

export function pick<T>(value: T | undefined | null, fallback: T): T {
  return value === undefined || value === null ? fallback : value;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
