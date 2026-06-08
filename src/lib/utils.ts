export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-KE').format(value);
}

export function imageUrl(path: string) {
  return path.replace(/ /g, '%20');
}
