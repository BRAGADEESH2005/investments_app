export type GoldKarat = 18 | 22 | 24;

export function getGoldKarat(name: string): GoldKarat | null {
  const match = name.match(/\b(18|22|24)\s*k\b/i);
  return match ? Number(match[1]) as GoldKarat : null;
}

export function getGoldPrice(prices: Partial<Record<GoldKarat, number>>, name: string) {
  const karat = getGoldKarat(name) || 24;
  return { karat, pricePerGram: prices[karat] || 0 };
}
