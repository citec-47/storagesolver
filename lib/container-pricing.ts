export const containerPrices = {
  FT10: 1000,
  FT20: 1500,
  FT40: 2000,
  FT45: 2500,
  FT53: 3000
} as const;

export type ContainerSize = keyof typeof containerPrices;

export function priceForContainerSize(size: ContainerSize): number {
  return containerPrices[size];
}

export function isPriceForContainerSize(size: ContainerSize, price: number): boolean {
  return price === containerPrices[size];
}
