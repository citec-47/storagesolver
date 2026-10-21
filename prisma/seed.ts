import { PrismaClient, ContainerCondition, ContainerSize, ContainerType, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const sizeCatalog = [
  { size: ContainerSize.FT10, basePrice: 2200, locations: ['Newark, NJ', 'Savannah, GA', 'Houston, TX', 'Miami, FL', 'Chicago, IL'] },
  { size: ContainerSize.FT20, basePrice: 3200, locations: ['Newark, NJ', 'Houston, TX', 'Savannah, GA', 'Portland, OR', 'Dallas, TX'] },
  { size: ContainerSize.FT40, basePrice: 4700, locations: ['Long Beach, CA', 'Chicago, IL', 'Dallas, TX', 'Houston, TX', 'Newark, NJ'] },
  { size: ContainerSize.FT45, basePrice: 6100, locations: ['Savannah, GA', 'Newark, NJ', 'Seattle, WA', 'Phoenix, AZ', 'Denver, CO'] },
  { size: ContainerSize.FT53, basePrice: 7600, locations: ['Los Angeles, CA', 'Dallas, TX', 'Houston, TX', 'Portland, OR', 'Seattle, WA'] }
] as const;

const templates = [
  { slug: 'one-trip-standard', title: 'One-Trip Standard', type: ContainerType.STANDARD, condition: ContainerCondition.ONE_TRIP, baseMultiplier: 1.04, featured: true },
  { slug: 'used-cargo-worthy', title: 'Used Cargo Worthy', type: ContainerType.STANDARD, condition: ContainerCondition.CARGO_WORTHY, baseMultiplier: 0.82 },
  { slug: 'wind-water-tight', title: 'Wind & Water Tight', type: ContainerType.STANDARD, condition: ContainerCondition.WIND_WATER_TIGHT, baseMultiplier: 0.88 },
  { slug: 'as-is-standard', title: 'As-Is Standard', type: ContainerType.STANDARD, condition: ContainerCondition.AS_IS, baseMultiplier: 0.62 },
  { slug: 'new-standard', title: 'New Standard', type: ContainerType.STANDARD, condition: ContainerCondition.NEW, baseMultiplier: 1.2 },
  { slug: 'high-cube-one-trip', title: 'High Cube One-Trip', type: ContainerType.HIGH_CUBE, condition: ContainerCondition.ONE_TRIP, baseMultiplier: 1.16, featured: true },
  { slug: 'high-cube-cargo-worthy', title: 'High Cube Cargo Worthy', type: ContainerType.HIGH_CUBE, condition: ContainerCondition.CARGO_WORTHY, baseMultiplier: 0.9 },
  { slug: 'high-cube-wind-water-tight', title: 'High Cube Wind & Water Tight', type: ContainerType.HIGH_CUBE, condition: ContainerCondition.WIND_WATER_TIGHT, baseMultiplier: 0.97 },
  { slug: 'high-cube-new', title: 'High Cube New', type: ContainerType.HIGH_CUBE, condition: ContainerCondition.NEW, baseMultiplier: 1.34 },
  { slug: 'open-top-one-trip', title: 'Open Top One-Trip', type: ContainerType.OPEN_TOP, condition: ContainerCondition.ONE_TRIP, baseMultiplier: 1.26 },
  { slug: 'open-top-cargo-worthy', title: 'Open Top Cargo Worthy', type: ContainerType.OPEN_TOP, condition: ContainerCondition.CARGO_WORTHY, baseMultiplier: 0.94 },
  { slug: 'flat-rack-one-trip', title: 'Flat Rack One-Trip', type: ContainerType.FLAT_RACK, condition: ContainerCondition.ONE_TRIP, baseMultiplier: 1.32 },
  { slug: 'flat-rack-cargo-worthy', title: 'Flat Rack Cargo Worthy', type: ContainerType.FLAT_RACK, condition: ContainerCondition.CARGO_WORTHY, baseMultiplier: 1.04 },
  { slug: 'reefer-one-trip', title: 'Reefer One-Trip', type: ContainerType.REEFER, condition: ContainerCondition.ONE_TRIP, baseMultiplier: 1.58 },
  { slug: 'side-door-one-trip', title: 'Side Door One-Trip', type: ContainerType.SIDE_DOOR, condition: ContainerCondition.ONE_TRIP, baseMultiplier: 1.18 }
] as const;

const inventory = sizeCatalog.flatMap((sizeEntry, sizeIndex) => templates.map((template, templateIndex) => {
  const feet = Number(sizeEntry.size.replace('FT', ''));
  const price = Math.round(sizeEntry.basePrice * template.baseMultiplier + (sizeIndex + 1) * 120 + templateIndex * 85);
  const location = sizeEntry.locations[(sizeIndex + templateIndex) % sizeEntry.locations.length];
  const slug = `${sizeEntry.size.toLowerCase()}-${template.slug}`;
  const title = `${feet}ft ${template.title}`;
  const highCube = template.type === ContainerType.HIGH_CUBE;
  const isFeatured = 'featured' in template && template.featured;
  return {
    slug,
    title,
    size: sizeEntry.size,
    type: template.type,
    condition: template.condition,
    price,
    stockQuantity: Math.max(1, 2 + sizeIndex + templateIndex + (isFeatured ? 3 : 0)),
    location,
    featured: Boolean(isFeatured) || (sizeIndex === 0 && templateIndex < 2),
    description: `A dependable ${title.toLowerCase()} inspected by our container team and available for delivery in ${location}.`,
    grade: template.condition === ContainerCondition.NEW || template.condition === ContainerCondition.ONE_TRIP ? 'A' : 'B',
    internalLength: `${Math.max(feet - 0.8, 9.6)} ft`,
    internalWidth: '7.7 ft',
    internalHeight: highCube ? '8.8 ft' : template.type === ContainerType.OPEN_TOP ? '7.8 ft' : '7.9 ft',
    externalLength: `${feet} ft`,
    externalWidth: '8 ft',
    externalHeight: highCube ? '9.6 ft' : template.type === ContainerType.OPEN_TOP ? '8.7 ft' : '8.6 ft',
    doorOpeningWidth: '7.7 ft',
    doorOpeningHeight: highCube ? '8.5 ft' : '7.5 ft',
    tareWeight: template.type === ContainerType.REEFER ? '6,800 lb' : '4,850 lb',
    maxPayload: template.type === ContainerType.REEFER ? '52,000 lb' : '59,000 lb',
    cubicCapacity: `${Math.round(feet * 7.7 * (highCube ? 8.8 : template.type === ContainerType.OPEN_TOP ? 7.7 : 7.9))} cu ft`,
    color: (sizeIndex + templateIndex) % 2 === 0 ? 'Deep ocean blue' : 'Industrial green',
    features: ['Lockable cargo doors', 'Wind and water resistant', 'Ground-level access']
  };
}));

async function main() {
  for (const [index, item] of inventory.entries()) {
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        ...item,
        status: ProductStatus.ACTIVE,
        images: {
          create: [{
            publicId: `containers/${item.slug}/main-placeholder`,
            alt: `${item.title} shipping container`,
            sortOrder: 0
          }]
        }
      }
    });
  }

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: { passwordHash },
      create: { email: process.env.ADMIN_EMAIL, name: 'Store Administrator', passwordHash }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });