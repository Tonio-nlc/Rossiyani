export function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i++) {
    matrix[i]![0] = i;
  }
  for (let j = 0; j < cols; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost,
      );
    }
  }

  return matrix[a.length]![b.length]!;
}

export function findClosestKnownForm(
  surface: string,
  knownForms: string[],
  maxDistance = 2,
): string | null {
  const target = surface.toLowerCase();
  let best: { word: string; distance: number } | null = null;

  for (const candidate of knownForms) {
    const distance = levenshteinDistance(target, candidate.toLowerCase());
    const threshold = Math.max(maxDistance, Math.floor(target.length * 0.35));
    if (distance > threshold) {
      continue;
    }
    if (!best || distance < best.distance) {
      best = { word: candidate, distance };
    }
  }

  return best?.word ?? null;
}
