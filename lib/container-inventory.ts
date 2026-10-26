import { priceForContainerSize } from './container-pricing';

export const containerPhotoGroups = [
  { size: 'FT10', feet: 10, folder: '10ft containers', sourceCount: 15, photoNumbers: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { size: 'FT20', feet: 20, folder: '20ft containers', sourceCount: 18, photoNumbers: [2, 3, 4, 5, 8, 9, 14, 16, 17] },
  { size: 'FT40', feet: 40, folder: '40ft containers', sourceCount: 18, photoNumbers: Array.from({ length: 18 }, (_, index) => index + 1) },
  { size: 'FT45', feet: 45, folder: '45ft containers', sourceCount: 19, photoNumbers: Array.from({ length: 19 }, (_, index) => index + 1) },
  { size: 'FT53', feet: 53, folder: '53ft containers', sourceCount: 20, photoNumbers: Array.from({ length: 20 }, (_, index) => index + 1) }
] as const;

const twentyFootDoorListings: Record<number, { title: string; slug: string; price: number; type: 'STANDARD' | 'SIDE_DOOR' }> = {
  2: { title: 'Both End Opening Doors 20ft Shipping Containers', slug: '20ft-both-end-opening-doors', price: 1700, type: 'STANDARD' },
  3: { title: 'All Side Opening Doors 20ft Shipping Containers', slug: '20ft-all-side-opening-doors', price: 1800, type: 'SIDE_DOOR' },
  4: { title: 'Side Double Roll Up Doors 20ft Shipping Containers', slug: '20ft-side-double-roll-up-doors', price: 1700, type: 'SIDE_DOOR' },
  5: { title: 'Roll Up Doors 20ft Shipping Containers', slug: '20ft-roll-up-doors', price: 1600, type: 'SIDE_DOOR' }
};

const feedbackImagesBySlug: Record<string, string[]> = {
  '20ft-both-end-opening-doors': [
    '/local-container-photos/20ft-both-end-opening-doors-1.jpeg',
    '/local-container-photos/20ft-both-end-opening-doors-2.jpeg'
  ],
  '20ft-all-side-opening-doors': [
    '/local-container-photos/20ft-all-side-opening-doors-1.jpeg',
    '/local-container-photos/20ft-all-side-opening-doors-2.jpeg',
    '/local-container-photos/20ft-all-side-opening-doors-3.jpeg'
  ],
  '20ft-side-double-roll-up-doors': [
    '/local-container-photos/20ft-side-double-roll-up-doors-1.jpeg',
    '/local-container-photos/20ft-side-double-roll-up-doors-2.jpeg',
    '/local-container-photos/20ft-side-double-roll-up-doors-3.jpeg',
    '/local-container-photos/20ft-side-double-roll-up-doors-4.jpeg'
  ],
  '20ft-roll-up-doors': [
    '/local-container-photos/20ft-roll-up-doors-1.jpeg',
    '/local-container-photos/20ft-roll-up-doors-2.jpeg'
  ],
  '10ft-roll-up-doors': [
    '/local-container-photos/10ft-roll-up-doors-1.jpeg',
    '/local-container-photos/10ft-roll-up-doors-2.jpeg'
  ]
};

export const retiredContainerSlugs = [
  'ft10-container-06',
  'ft20-container-01',
  'ft20-container-02',
  'ft20-container-03',
  'ft20-container-04',
  'ft20-container-05',
  'ft20-container-06',
  'ft20-container-07',
  'ft20-container-10',
  'ft20-container-11',
  'ft20-container-12',
  'ft20-container-13',
  'ft20-container-15',
  'ft20-container-18',
  'ft40-container-05',
  'ft40-container-06',
  'ft40-container-07',
  'ft53-container-10',
  'ft53-container-11',
  'ft53-container-14'
];

export function buildContainerInventory() {
  return containerPhotoGroups.flatMap(({ size, feet, photoNumbers }) =>
    photoNumbers
      .map((photoNumber) => {
        const number = String(photoNumber).padStart(2, '0');
        const doorListing = size === 'FT20' ? twentyFootDoorListings[photoNumber] : undefined;
        const title = doorListing?.title
          ?? (size === 'FT20' && photoNumber === 9
            ? 'Standard 20ft Shipping Container 09'
            : `${feet}ft Shipping Container ${number}`);
        return {
          slug: doorListing?.slug ?? `${size.toLowerCase()}-container-${number}`,
          title,
          size,
          type: doorListing?.type ?? 'STANDARD' as const,
          condition: 'WIND_WATER_TIGHT' as const,
          price: doorListing?.price ?? priceForContainerSize(size),
          stockQuantity: 1,
          location: 'Contact for availability',
          description: `${title}. Contact us to confirm availability and delivery options.`,
          featured: photoNumber === photoNumbers[0],
          imagePaths: feedbackImagesBySlug[doorListing?.slug ?? ''] ?? [`/local-container-photos/${feet}ft-${number}.jpeg`]
        };
      })
      .filter((product) => !retiredContainerSlugs.includes(product.slug))
  ).concat([{
    slug: '10ft-roll-up-doors',
    title: '10ft Roll Up Doors Shipping Containers',
    size: 'FT10' as const,
    type: 'STANDARD' as const,
    condition: 'WIND_WATER_TIGHT' as const,
    price: priceForContainerSize('FT10'),
    stockQuantity: 1,
    location: 'Contact for availability',
    description: '10ft Roll Up Doors Shipping Containers. Contact us to confirm availability and delivery options.',
    featured: false,
    imagePaths: feedbackImagesBySlug['10ft-roll-up-doors']
  }]);
}
