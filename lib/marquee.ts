export function buildSeamlessMarqueeLoop<T>(items: readonly T[], minItemsPerHalf = 18): T[] {
  if (items.length === 0) {
    return [];
  }

  const half: T[] = [];
  while (half.length < minItemsPerHalf) {
    half.push(...items);
  }

  return [...half, ...half];
}
