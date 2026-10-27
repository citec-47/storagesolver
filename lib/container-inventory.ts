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
    'containers/20ft-both-end-opening-doors/feedback-1',
    'containers/20ft-both-end-opening-doors/feedback-2'
  ],
  '20ft-all-side-opening-doors': [
    'containers/20ft-all-side-opening-doors/feedback-1',
    'containers/20ft-all-side-opening-doors/feedback-2',
    'containers/20ft-all-side-opening-doors/feedback-3'
  ],
  '20ft-side-double-roll-up-doors': [
    'containers/20ft-side-double-roll-up-doors/feedback-1',
    'containers/20ft-side-double-roll-up-doors/feedback-2',
    'containers/20ft-side-double-roll-up-doors/feedback-3',
    'containers/20ft-side-double-roll-up-doors/feedback-4'
  ],
  '20ft-roll-up-doors': [
    'containers/20ft-roll-up-doors/feedback-1',
    'containers/20ft-roll-up-doors/feedback-2'
  ],
  '10ft-roll-up-doors': [
    '/local-container-photos/10ft-roll-up-doors-1.jpeg',
    '/local-container-photos/10ft-roll-up-doors-2.jpeg'
  ]
};

const additionalTwentyFootListings = [
  {
    slug: '20ft-standard-container-a',
    title: '20ft Shipping Container',
    size: 'FT20' as const,
    type: 'STANDARD' as const,
    condition: 'WIND_WATER_TIGHT' as const,
    price: priceForContainerSize('FT20'),
    stockQuantity: 1,
    location: 'Contact for availability',
    description: '20ft Shipping Container. Contact us to confirm availability and delivery options.',
    featured: false,
    imagePaths: ['/local-container-photos/20ft-standard-container-a.jpeg']
  },
  {
    slug: '20ft-standard-container-b',
    title: '20ft Shipping Container',
    size: 'FT20' as const,
    type: 'STANDARD' as const,
    condition: 'WIND_WATER_TIGHT' as const,
    price: priceForContainerSize('FT20'),
    stockQuantity: 1,
    location: 'Contact for availability',
    description: '20ft Shipping Container. Contact us to confirm availability and delivery options.',
    featured: false,
    imagePaths: ['/local-container-photos/20ft-standard-container-b.jpeg']
  },
  {
    slug: '20ft-standard-container-c',
    title: '20ft Shipping Container',
    size: 'FT20' as const,
    type: 'STANDARD' as const,
    condition: 'WIND_WATER_TIGHT' as const,
    price: priceForContainerSize('FT20'),
    stockQuantity: 1,
    location: 'Contact for availability',
    description: '20ft Shipping Container. Contact us to confirm availability and delivery options.',
    featured: false,
    imagePaths: ['/local-container-photos/20ft-standard-container-c.jpeg']
  },
  {
    slug: '20ft-standard-container-d',
    title: '20ft Shipping Container',
    size: 'FT20' as const,
    type: 'STANDARD' as const,
    condition: 'WIND_WATER_TIGHT' as const,
    price: priceForContainerSize('FT20'),
    stockQuantity: 1,
    location: 'Contact for availability',
    description: '20ft Shipping Container. Contact us to confirm availability and delivery options.',
    featured: false,
    imagePaths: ['/local-container-photos/20ft-standard-container-d.jpeg']
  },
  {
    slug: '20ft-single-side-roll-up-door',
    title: '20ft Single Side Roll Up Door Shipping Container',
    size: 'FT20' as const,
    type: 'SIDE_DOOR' as const,
    condition: 'WIND_WATER_TIGHT' as const,
    price: priceForContainerSize('FT20'),
    stockQuantity: 1,
    location: 'Contact for availability',
    description: '20ft Single Side Roll Up Door Shipping Container. Contact us to confirm availability and delivery options.',
    featured: false,
    imagePaths: ['/local-container-photos/20ft-single-side-roll-up-door.jpeg']
  },
  {
    slug: '20ft-open-side-door',
    title: '20ft Open Side Door Shipping Container',
    size: 'FT20' as const,
    type: 'SIDE_DOOR' as const,
    condition: 'WIND_WATER_TIGHT' as const,
    price: 1800,
    stockQuantity: 1,
    location: 'Contact for availability',
    description: '20ft Open Side Door Shipping Container. Contact us to confirm availability and delivery options.',
    featured: false,
    imagePaths: ['containers/20ft-open-side-door/open-side-door']
  },
  {
    slug: '20ft-high-cube-open-side',
    title: '20ft High Cube Open Side Shipping Container',
    size: 'FT20' as const,
    type: 'SIDE_DOOR' as const,
    condition: 'WIND_WATER_TIGHT' as const,
    price: 1800,
    stockQuantity: 1,
    location: 'Contact for availability',
    description: '20ft High Cube Open Side Shipping Container. Contact us to confirm availability and delivery options.',
    featured: false,
    imagePaths: ['containers/20ft-high-cube-open-side/high-cube-open-side']
  },
  {
    slug: '20ft-modified-canteen-unit',
    title: '20ft Modified Canteen Unit Container',
    size: 'FT20' as const,
    type: 'OFFICE_MODIFIED' as const,
    condition: 'WIND_WATER_TIGHT' as const,
    price: 1500,
    stockQuantity: 1,
    location: 'Contact for availability',
    description: '20ft Modified Canteen Unit Container. Contact us to confirm availability and delivery options.',
    featured: false,
    imagePaths: ['containers/20ft-modified-canteen-unit/modified-canteen-unit']
  },
  {
    slug: '20ft-open-side-container',
    title: '20ft Open Side Shipping Container',
    size: 'FT20' as const,
    type: 'SIDE_DOOR' as const,
    condition: 'WIND_WATER_TIGHT' as const,
    price: 1800,
    stockQuantity: 1,
    location: 'Contact for availability',
    description: '20ft Open Side Shipping Container. Contact us to confirm availability and delivery options.',
    featured: false,
    imagePaths: ['containers/20ft-open-side-container/open-side-container']
  },
  {
    slug: '20ft-high-cube-full-open-side',
    title: '20ft High Cube Full Open Side Shipping Container',
    size: 'FT20' as const,
    type: 'SIDE_DOOR' as const,
    condition: 'WIND_WATER_TIGHT' as const,
    price: 1800,
    stockQuantity: 1,
    location: 'Contact for availability',
    description: '20ft High Cube Full Open Side Shipping Container. Contact us to confirm availability and delivery options.',
    featured: false,
    imagePaths: ['containers/20ft-high-cube-full-open-side/high-cube-full-open-side']
  }
];

const additionalTenFootListings = [
  {
    slug: '10ft-drip-tray-container',
    title: '10ft Drip Tray Shipping Container',
    type: 'STANDARD' as const,
    imagePaths: ['containers/10ft-drip-tray-container/drip-tray']
  },
  {
    slug: '10ft-full-glass-unit',
    title: '10ft Full Glass Unit',
    type: 'OFFICE_MODIFIED' as const,
    imagePaths: ['containers/10ft-full-glass-unit/full-glass-unit']
  },
  {
    slug: '10ft-high-cube-security-observation-container',
    title: '10ft High Cube Security Observation Container',
    type: 'OFFICE_MODIFIED' as const,
    imagePaths: ['containers/10ft-high-cube-security-observation-container/security-observation']
  },
  {
    slug: '10ft-high-cube-container',
    title: '10ft High Cube Shipping Container',
    type: 'HIGH_CUBE' as const,
    imagePaths: ['containers/10ft-high-cube-container/high-cube']
  },
  {
    slug: '10ft-office-container',
    title: '10ft Office Container',
    type: 'OFFICE_MODIFIED' as const,
    imagePaths: ['containers/10ft-office-container/office']
  },
  {
    slug: '10ft-refrigerated-freezer-container',
    title: '10ft Refrigerated Freezer Container',
    type: 'REEFER' as const,
    imagePaths: ['containers/10ft-refrigerated-freezer-container/refrigerated-freezer']
  },
  {
    slug: '10ft-double-door-container',
    title: '10ft Shipping Container Double Door',
    type: 'STANDARD' as const,
    imagePaths: ['containers/10ft-double-door-container/double-door']
  },
  {
    slug: '10ft-steel-floor-container',
    title: '10ft Shipping Container Steel Floor',
    type: 'STANDARD' as const,
    imagePaths: ['containers/10ft-steel-floor-container/steel-floor']
  },
  {
    slug: '10ft-wooden-floor-container',
    title: '10ft Shipping Container Wooden Floor',
    type: 'STANDARD' as const,
    imagePaths: ['containers/10ft-wooden-floor-container/wooden-floor']
  },
  {
    slug: '10ft-shipping-container-16',
    title: '10ft Shipping Container 16',
    type: 'STANDARD' as const,
    imagePaths: ['containers/10ft-shipping-container-16/container']
  },
  {
    slug: '10ft-shipping-container-17',
    title: '10ft Shipping Container 17',
    type: 'STANDARD' as const,
    imagePaths: ['containers/10ft-shipping-container-17/container']
  },
  {
    slug: '10ft-shipping-container-18',
    title: '10ft Shipping Container 18',
    type: 'STANDARD' as const,
    imagePaths: ['containers/10ft-shipping-container-18/container']
  },
  {
    slug: '10ft-shipping-container-19',
    title: '10ft Shipping Container 19',
    type: 'STANDARD' as const,
    imagePaths: ['containers/10ft-shipping-container-19/container']
  },
  {
    slug: '10ft-shipping-container-20',
    title: '10ft Shipping Container 20',
    type: 'STANDARD' as const,
    imagePaths: ['containers/10ft-shipping-container-20/container']
  },
  {
    slug: '10ft-workshop-container',
    title: '10ft Workshop Shipping Container',
    type: 'OFFICE_MODIFIED' as const,
    imagePaths: ['containers/10ft-workshop-container/workshop']
  },
  {
    slug: '10ft-high-cube-roll-up-door-container',
    title: '10ft High Cube Roll Up Door Storage Container',
    type: 'SIDE_DOOR' as const,
    imagePaths: [
      'containers/10ft-high-cube-roll-up-door-container/roll-up-door-1',
      'containers/10ft-high-cube-roll-up-door-container/roll-up-door-2'
    ]
  }
].map(({ slug, title, type, imagePaths }) => ({
  slug,
  title,
  size: 'FT10' as const,
  type,
  condition: 'WIND_WATER_TIGHT' as const,
  price: priceForContainerSize('FT10'),
  stockQuantity: 1,
  location: 'Contact for availability',
  description: `${title}. Contact us to confirm availability and delivery options.`,
  featured: false,
  imagePaths
}));

const additionalFortyFootListings = [
  {
    slug: '40ft-high-cube-open-side-1',
    title: '40ft High Cube Open Side Shipping Container',
    type: 'SIDE_DOOR' as const,
    image: 'high-cube-open-side-1'
  },
  {
    slug: '40ft-high-cube-open-side-2',
    title: '40ft High Cube Open Side Container',
    type: 'SIDE_DOOR' as const,
    image: 'high-cube-open-side-2'
  },
  {
    slug: '40ft-double-door-high-cube-1',
    title: '40ft Double Door High Cube Shipping Container',
    type: 'STANDARD' as const,
    image: 'double-door-high-cube-1'
  },
  {
    slug: '40ft-double-door-high-cube-2',
    title: '40ft Double Door High Cube Shipping Container',
    type: 'STANDARD' as const,
    image: 'double-door-high-cube-2'
  },
  {
    slug: '40ft-high-cube-refrigerated-container',
    title: '40ft High Cube Refrigerated Container',
    type: 'REEFER' as const,
    image: 'high-cube-refrigerated'
  },
  {
    slug: '40ft-high-cube-container',
    title: '40ft High Cube Shipping Container',
    type: 'HIGH_CUBE' as const,
    image: 'high-cube'
  },
  {
    slug: '40ft-high-cube-open-side-3',
    title: '40ft High Cube Open Side Shipping Container',
    type: 'SIDE_DOOR' as const,
    image: 'high-cube-open-side-3'
  },
  {
    slug: '40ft-high-cube-open-side-4',
    title: '40ft High Cube Open Side Shipping Container',
    type: 'SIDE_DOOR' as const,
    image: 'high-cube-open-side-4'
  },
  {
    slug: '40ft-high-cube-side-door-1',
    title: '40ft High Cube Side Door Shipping Container',
    type: 'SIDE_DOOR' as const,
    image: 'high-cube-side-door-1'
  },
  {
    slug: '40ft-high-cube-side-door-2',
    title: '40ft High Cube Side Door Shipping Container',
    type: 'SIDE_DOOR' as const,
    image: 'high-cube-side-door-2'
  },
  {
    slug: '40ft-high-cube-side-door-3',
    title: '40ft High Cube Side Door Shipping Container',
    type: 'SIDE_DOOR' as const,
    image: 'high-cube-side-door-3'
  },
  {
    slug: '40ft-high-cube-side-door-4',
    title: '40ft High Cube Side Door Shipping Container',
    type: 'SIDE_DOOR' as const,
    image: 'high-cube-side-door-4'
  },
  {
    slug: '40ft-high-cube-used-container',
    title: '40ft High Cube Used Shipping Container',
    type: 'HIGH_CUBE' as const,
    image: 'high-cube-used'
  },
  {
    slug: '40ft-shipping-container-19',
    title: '40ft Shipping Container 19',
    type: 'STANDARD' as const,
    image: 'shipping-container-19'
  },
  {
    slug: '40ft-shipping-container-20',
    title: '40ft Shipping Container 20',
    type: 'STANDARD' as const,
    image: 'shipping-container-20'
  },
  {
    slug: '40ft-shipping-container-21',
    title: '40ft Shipping Container 21',
    type: 'STANDARD' as const,
    image: 'shipping-container-21'
  },
  {
    slug: '40ft-side-door-container',
    title: '40ft Side Doors Shipping Container',
    type: 'SIDE_DOOR' as const,
    image: 'side-door'
  }
].map(({ slug, title, type, image }) => ({
  slug,
  title,
  size: 'FT40' as const,
  type,
  condition: 'WIND_WATER_TIGHT' as const,
  price: priceForContainerSize('FT40'),
  stockQuantity: 1,
  location: 'Contact for availability',
  description: `${title}. Contact us to confirm availability and delivery options.`,
  featured: false,
  imagePaths: [`containers/${slug}/${image}`]
}));

const additionalFortyFiveFootListings = [
  { slug: '45ft-high-cube-container-1', title: '45ft High Cube Shipping Container', type: 'HIGH_CUBE' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'high-cube-1' },
  { slug: '45ft-high-cube-container-2', title: '45ft High Cube Shipping Container', type: 'HIGH_CUBE' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'high-cube-2' },
  { slug: '45ft-high-cube-container-3', title: '45ft High Cube Shipping Container', type: 'HIGH_CUBE' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'high-cube-3' },
  { slug: '45ft-high-cube-container-4', title: '45ft High Cube Shipping Container', type: 'HIGH_CUBE' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'high-cube-4' },
  { slug: '45ft-high-cube-dry-container', title: '45ft High Cube Dry Container', type: 'HIGH_CUBE' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'high-cube-dry' },
  { slug: '45ft-high-cube-container-5', title: '45ft High Cube Shipping Container', type: 'HIGH_CUBE' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'high-cube-5' },
  { slug: '45ft-shipping-container-20', title: '45ft Shipping Container', type: 'STANDARD' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'shipping-container-20' },
  { slug: '45ft-shipping-container-21', title: '45ft Shipping Container', type: 'STANDARD' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'shipping-container-21' },
  { slug: '45ft-high-cube-one-trip-1', title: '45ft High Cube One-Trip Shipping Container', type: 'HIGH_CUBE' as const, condition: 'ONE_TRIP' as const, image: 'high-cube-one-trip-1' },
  { slug: '45ft-high-cube-roll-up-doors', title: '45ft High Cube Shipping Container with 4 Roll Up Doors', type: 'SIDE_DOOR' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'high-cube-roll-up-doors' },
  { slug: '45ft-one-trip-high-cube-1', title: '45ft One-Trip High Cube Container', type: 'HIGH_CUBE' as const, condition: 'ONE_TRIP' as const, image: 'one-trip-high-cube-1' },
  { slug: '45ft-one-trip-high-cube-2', title: '45ft One-Trip High Cube Container', type: 'HIGH_CUBE' as const, condition: 'ONE_TRIP' as const, image: 'one-trip-high-cube-2' },
  { slug: '45ft-one-trip-high-cube-3', title: '45ft One-Trip High Cube Container', type: 'HIGH_CUBE' as const, condition: 'ONE_TRIP' as const, image: 'one-trip-high-cube-3' },
  { slug: '45ft-container-front-open', title: '45ft Shipping Container Front Open', type: 'STANDARD' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'container-front-open' },
  { slug: '45ft-container-side-closed', title: '45ft Shipping Container Side Closed', type: 'STANDARD' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'container-side-closed' },
  { slug: '45ft-container-side-open', title: '45ft Shipping Container Side Open', type: 'SIDE_DOOR' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'container-side-open' },
  { slug: '45ft-one-trip-container', title: '45ft One-Trip Shipping Container', type: 'STANDARD' as const, condition: 'ONE_TRIP' as const, image: 'one-trip-container' },
  { slug: '45ft-one-trip-cargo-door-open', title: '45ft One-Trip Shipping Container Cargo Door Open', type: 'STANDARD' as const, condition: 'ONE_TRIP' as const, image: 'one-trip-cargo-door-open' },
  { slug: '45ft-one-trip-roll-up-doors', title: '45ft One-Trip Shipping Container with Roll Up Doors', type: 'SIDE_DOOR' as const, condition: 'ONE_TRIP' as const, image: 'one-trip-roll-up-doors' },
  { slug: '45ft-shipping-container-side-cut', title: '45ft Shipping Container Side Cut', type: 'SIDE_DOOR' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'shipping-container-side-cut' },
  { slug: '45ft-used-grade-a-blue-container', title: '45ft Used Grade A Blue Shipping Container', type: 'STANDARD' as const, condition: 'CARGO_WORTHY' as const, image: 'used-grade-a-blue' },
  { slug: '45ft-shipping-container-roll-up-doors', title: '45ft Shipping Container with Roll Up Doors', type: 'SIDE_DOOR' as const, condition: 'WIND_WATER_TIGHT' as const, image: 'shipping-container-roll-up-doors' }
].map(({ slug, title, type, condition, image }) => ({
  slug,
  title,
  size: 'FT45' as const,
  type,
  condition,
  price: priceForContainerSize('FT45'),
  stockQuantity: 1,
  location: 'Contact for availability',
  description: `${title}. Contact us to confirm availability and delivery options.`,
  featured: false,
  imagePaths: [`containers/${slug}/${image}`]
}));

const additionalFiftyThreeFootListings = [
  {
    slug: '53ft-high-cube-side-opening-container',
    title: '53ft High Cube Side Opening Shipping Container',
    type: 'SIDE_DOOR' as const,
    images: ['side-opening-1', 'side-opening-2']
  },
  {
    slug: '53ft-high-cube-roll-up-door-container',
    title: '53ft High Cube Shipping Container with Roll Up Doors',
    type: 'SIDE_DOOR' as const,
    images: ['roll-up-doors-1', 'roll-up-doors-2']
  },
  {
    slug: '53ft-high-cube-side-and-end-door-container',
    title: '53ft High Cube Container with Side and End Door',
    type: 'SIDE_DOOR' as const,
    images: ['side-and-end-door']
  },
  {
    slug: '53ft-high-cube-container-1',
    title: '53ft High Cube Container',
    type: 'HIGH_CUBE' as const,
    images: ['high-cube-1']
  },
  {
    slug: '53ft-high-cube-container-2',
    title: '53ft High Cube Shipping Container',
    type: 'HIGH_CUBE' as const,
    images: ['high-cube-2']
  },
  {
    slug: '53ft-open-side-door-container',
    title: '53ft Open Side Door Shipping Container',
    type: 'SIDE_DOOR' as const,
    images: ['open-side-1', 'open-side-2']
  },
  {
    slug: '53ft-retreat-cabin-container',
    title: '53ft Retreat Cabin Container',
    type: 'OFFICE_MODIFIED' as const,
    images: ['retreat-cabin-front', 'retreat-cabin-back', 'retreat-cabin-back-close-up', 'retreat-cabin-close-up']
  },
  {
    slug: '53ft-one-trip-shipping-container',
    title: '53ft New One-Trip Shipping Container',
    type: 'STANDARD' as const,
    images: ['new-one-trip']
  }
].map(({ slug, title, type, images }) => ({
  slug,
  title,
  size: 'FT53' as const,
  type,
  condition: 'WIND_WATER_TIGHT' as const,
  price: priceForContainerSize('FT53'),
  stockQuantity: 1,
  location: 'Contact for availability',
  description: `${title}. Contact us to confirm availability and delivery options.`,
  featured: false,
  imagePaths: images.map((image) => `containers/${slug}/${image}`)
}));

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
  return [
    ...containerPhotoGroups.flatMap(({ size, feet, photoNumbers }) =>
      photoNumbers
        .map((photoNumber) => {
          const number = String(photoNumber).padStart(2, '0');
          const doorListing = size === 'FT20' ? twentyFootDoorListings[photoNumber] : undefined;
          const title = doorListing?.title
            ?? `${feet}ft Shipping Container`;
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
    ),
    ...additionalTenFootListings,
    ...additionalFortyFootListings,
    ...additionalFortyFiveFootListings,
    ...additionalFiftyThreeFootListings,
    ...additionalTwentyFootListings,
    {
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
    }
  ];
}
