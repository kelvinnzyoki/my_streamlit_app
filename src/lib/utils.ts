export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function imageUrl(src?: string) {
  if (!src) return '/images/fit (1).webp';
  if (src.startsWith('http') || src.startsWith('/')) return src;
  const exerciseNames = [
    'boxjumps','burpees','buttkicks','childpose','crunches','downwarddog','glutebridges','highknees','hipflexor','jumpingjacks','jumpsquats','legraises','lunges','mountainclimbers','pikepushups','plank','pushups','russiantwists','sprints','squats','tricepdips'
  ];
  const lower = src.toLowerCase();
  if (exerciseNames.some((name) => lower.includes(name))) return `/images/exercises/${src}`;
  return `/images/${src}`;
}

export function formatNumber(value?: number | string) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toLocaleString() : '0';
}

export function pick<T>(value: T | undefined | null, fallback: T): T {
  return value === undefined || value === null ? fallback : value;
}
