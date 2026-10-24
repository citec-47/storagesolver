import { priceForContainerSize } from './container-pricing';

export const containerPhotoGroups = [
  { size: 'FT10', feet: 10, folder: '10ft containers', count: 6 },
  { size: 'FT20', feet: 20, folder: '20ft containers', count: 8 },
  { size: 'FT40', feet: 40, folder: '40ft containers', count: 10 },
  { size: 'FT45', feet: 45, folder: '45ft containers', count: 6 },
  { size: 'FT53', feet: 53, folder: '53ft containers', count: 7 }
] as const;

export function buildContainerInventory() {
  return containerPhotoGroups.flatMap(({ size, feet, count }) =>
    Array.from({ length: count }, (_, index) => {
      const number = String(index + 1).padStart(2, '0');
      const title = `${feet}ft Shipping Container ${number}`;
      return {
        slug: `${size.toLowerCase()}-container-${number}`,
        title,
        size,
        type: 'STANDARD' as const,
        condition: 'WIND_WATER_TIGHT' as const,
        price: priceForContainerSize(size),
        stockQuantity: 1,
        location: 'Contact for availability',
        description: `${title}. Contact us to confirm availability and delivery options.`,
        featured: index === 0,
        imagePath: `/local-container-photos/${feet}ft-${number}.jpeg`
      };
    })
  );
}
