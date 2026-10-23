export const containerPriceRanges = {
  FT10: { min: 1000, max: 1500 },
  FT20: { min: 1500, max: 2000 },
  FT40: { min: 2000, max: 2500 },
  FT45: { min: 2500, max: 3000 },
  FT53: { min: 3000, max: 3500 }
} as const;

export type ContainerSize = keyof typeof containerPriceRanges;

export function priceForContainerSize(size: ContainerSize, position: number, total: number): number {
  const range = containerPriceRanges[size];
  const ratio = total <= 1 ? 0 : Math.min(Math.max(position, 0), total - 1) / (total - 1);
  return Math.round(range.min + (range.max - range.min) * ratio);
}

export function isPriceInContainerRange(size: ContainerSize, price: number): boolean {
  const range = containerPriceRanges[size];
  return price >= range.min && price <= range.max;
}
