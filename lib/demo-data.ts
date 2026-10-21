import { conditionLabels, sizeLabels, typeLabels } from '@/lib/config';

export type CatalogProduct = {
  id: string;
  slug: string;
  title: string;
  size: string;
  type: string;
  condition: string;
  grade: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  location: string;
  description: string;
  internalLength: string;
  internalWidth: string;
  internalHeight: string;
  externalLength: string;
  externalWidth: string;
  externalHeight: string;
  doorOpeningWidth: string;
  doorOpeningHeight: string;
  tareWeight: string;
  maxPayload: string;
  cubicCapacity: string;
  color: string;
  features: string[];
  featured: boolean;
  status: string;
  images: { id: string; publicId: string; alt: string; sortOrder: number }[];
  createdAt: Date;
};

const sizeCatalog = [
  { size: 'FT10', basePrice: 2200, locations: ['Newark, NJ', 'Savannah, GA', 'Houston, TX', 'Miami, FL', 'Chicago, IL'] },
  { size: 'FT20', basePrice: 3200, locations: ['Newark, NJ', 'Houston, TX', 'Savannah, GA', 'Portland, OR', 'Dallas, TX'] },
  { size: 'FT40', basePrice: 4700, locations: ['Long Beach, CA', 'Chicago, IL', 'Dallas, TX', 'Houston, TX', 'Newark, NJ'] },
  { size: 'FT45', basePrice: 6100, locations: ['Savannah, GA', 'Newark, NJ', 'Seattle, WA', 'Phoenix, AZ', 'Denver, CO'] },
  { size: 'FT53', basePrice: 7600, locations: ['Los Angeles, CA', 'Dallas, TX', 'Houston, TX', 'Portland, OR', 'Seattle, WA'] }
] as const;

const templates = [
  { slug: 'one-trip-standard', title: 'One-Trip Standard', type: 'STANDARD', condition: 'ONE_TRIP', baseMultiplier: 1.04, featured: true },
  { slug: 'used-cargo-worthy', title: 'Used Cargo Worthy', type: 'STANDARD', condition: 'CARGO_WORTHY', baseMultiplier: 0.82 },
  { slug: 'wind-water-tight', title: 'Wind & Water Tight', type: 'STANDARD', condition: 'WIND_WATER_TIGHT', baseMultiplier: 0.88 },
  { slug: 'as-is-standard', title: 'As-Is Standard', type: 'STANDARD', condition: 'AS_IS', baseMultiplier: 0.62 },
  { slug: 'new-standard', title: 'New Standard', type: 'STANDARD', condition: 'NEW', baseMultiplier: 1.2 },
  { slug: 'high-cube-one-trip', title: 'High Cube One-Trip', type: 'HIGH_CUBE', condition: 'ONE_TRIP', baseMultiplier: 1.16, featured: true },
  { slug: 'high-cube-cargo-worthy', title: 'High Cube Cargo Worthy', type: 'HIGH_CUBE', condition: 'CARGO_WORTHY', baseMultiplier: 0.9 },
  { slug: 'high-cube-wind-water-tight', title: 'High Cube Wind & Water Tight', type: 'HIGH_CUBE', condition: 'WIND_WATER_TIGHT', baseMultiplier: 0.97 },
  { slug: 'high-cube-new', title: 'High Cube New', type: 'HIGH_CUBE', condition: 'NEW', baseMultiplier: 1.34 },
  { slug: 'open-top-one-trip', title: 'Open Top One-Trip', type: 'OPEN_TOP', condition: 'ONE_TRIP', baseMultiplier: 1.26 },
  { slug: 'open-top-cargo-worthy', title: 'Open Top Cargo Worthy', type: 'OPEN_TOP', condition: 'CARGO_WORTHY', baseMultiplier: 0.94 },
  { slug: 'flat-rack-one-trip', title: 'Flat Rack One-Trip', type: 'FLAT_RACK', condition: 'ONE_TRIP', baseMultiplier: 1.32 },
  { slug: 'flat-rack-cargo-worthy', title: 'Flat Rack Cargo Worthy', type: 'FLAT_RACK', condition: 'CARGO_WORTHY', baseMultiplier: 1.04 },
  { slug: 'reefer-one-trip', title: 'Reefer One-Trip', type: 'REEFER', condition: 'ONE_TRIP', baseMultiplier: 1.58 },
  { slug: 'side-door-one-trip', title: 'Side Door One-Trip', type: 'SIDE_DOOR', condition: 'ONE_TRIP', baseMultiplier: 1.18 }
] as const;

export const demoProducts: CatalogProduct[] = sizeCatalog.flatMap((sizeEntry, sizeIndex) => templates.map((template, templateIndex) => {
  const feet = Number(sizeEntry.size.replace('FT', ''));
  const highCube = template.type === 'HIGH_CUBE';
  const price = Math.round(sizeEntry.basePrice * template.baseMultiplier + (sizeIndex + 1) * 120 + templateIndex * 85);
  const isFeatured = 'featured' in template && template.featured;
  const stockQuantity = Math.max(1, 2 + sizeIndex + templateIndex + (isFeatured ? 3 : 0));
  const location = sizeEntry.locations[(sizeIndex + templateIndex) % sizeEntry.locations.length];
  const slug = `${sizeEntry.size.toLowerCase()}-${template.slug}`;
  const title = `${feet}ft ${template.title}`;
  return {
    id: `demo-${sizeIndex + 1}-${templateIndex + 1}`,
    slug,
    title,
    size: sizeEntry.size,
    type: template.type,
    condition: template.condition,
    grade: template.condition === 'NEW' || template.condition === 'ONE_TRIP' ? 'A' : 'B',
    price,
    stockQuantity,
    location,
    featured: Boolean(isFeatured) || (sizeIndex === 0 && templateIndex < 2),
    status: 'ACTIVE',
    description: `A dependable ${title.toLowerCase()} inspected by our container team and available for delivery in ${location}. Built for secure storage, transport, and job-site flexibility.`,
    internalLength: `${Math.max(feet - 0.8, 9.6)} ft`,
    internalWidth: '7.7 ft',
    internalHeight: highCube ? '8.8 ft' : template.type === 'OPEN_TOP' ? '7.8 ft' : '7.9 ft',
    externalLength: `${feet} ft`,
    externalWidth: '8 ft',
    externalHeight: highCube ? '9.6 ft' : template.type === 'OPEN_TOP' ? '8.7 ft' : '8.6 ft',
    doorOpeningWidth: '7.7 ft',
    doorOpeningHeight: highCube ? '8.5 ft' : '7.5 ft',
    tareWeight: template.type === 'REEFER' ? '6,800 lb' : '4,850 lb',
    maxPayload: template.type === 'REEFER' ? '52,000 lb' : '59,000 lb',
    cubicCapacity: `${Math.round(feet * 7.7 * (highCube ? 8.8 : template.type === 'OPEN_TOP' ? 7.7 : 7.9))} cu ft`,
    color: (sizeIndex + templateIndex) % 2 === 0 ? 'Deep ocean blue' : 'Industrial green',
    features: ['Lockable cargo doors', 'Wind and water resistant', 'Ground-level access'],
    images: [{ id: `image-${sizeIndex + 1}-${templateIndex + 1}`, publicId: `containers/${slug}/main-placeholder`, alt: `${title} shipping container`, sortOrder: 0 }],
    createdAt: new Date(Date.now() - (sizeIndex * 40 + templateIndex) * 86400000)
  };
}));

export function productDisplay(product: CatalogProduct) {
  return {
    ...product,
    sizeLabel: sizeLabels[product.size] ?? product.size,
    typeLabel: typeLabels[product.type] ?? product.type,
    conditionLabel: conditionLabels[product.condition] ?? product.condition
  };
}