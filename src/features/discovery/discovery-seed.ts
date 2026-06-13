/** FNV-1a 32-bit hash — deterministic across runtimes. */
export function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Local calendar date key (YYYY-MM-DD). */
export function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function discoverySeed(learnerId: string, dateKey: string): number {
  return hashString(`${learnerId}:${dateKey}`);
}

/** Map hash to [0, max). */
export function seededIndex(seed: number, max: number): number {
  if (max <= 0) {
    return 0;
  }
  return seed % max;
}

/** Map hash to [0, 100). */
export function seededPercent(seed: number): number {
  return seed % 100;
}
