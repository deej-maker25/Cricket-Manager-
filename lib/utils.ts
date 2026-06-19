export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function id(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36).slice(-4)}`;
}

export function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function chance(pct: number) {
  return Math.random() * 100 < pct;
}

export function money(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}£${Math.abs(Math.round(n)).toLocaleString("en-GB")}`;
}

export function pct(n: number) {
  return `${Math.round(n)}%`;
}
