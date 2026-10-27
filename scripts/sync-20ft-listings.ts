import { loadEnvConfig } from '@next/env';
import { Prisma, PrismaClient } from '@prisma/client';
import { buildContainerInventory } from '../lib/container-inventory';

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');
const lastContainersOnly = process.argv.includes('--last-containers');
const feedbackListingsOnly = process.argv.includes('--feedback-listings');
const tenFootFolderOnly = process.argv.includes('--ten-foot-folder');
const fortyFootFolderOnly = process.argv.includes('--forty-foot-folder');
const fortyFiveFootFolderOnly = process.argv.includes('--forty-five-foot-folder');
const fiftyThreeFootFolderOnly = process.argv.includes('--fifty-three-foot-folder');
const confirmedTarget = process.argv.find((argument) => argument.startsWith('--confirm-target='))?.split('=')[1];
const tenFootFolderSlugs = [
  '10ft-drip-tray-container',
  '10ft-full-glass-unit',
  '10ft-high-cube-security-observation-container',
  '10ft-high-cube-container',
  '10ft-office-container',
  '10ft-refrigerated-freezer-container',
  '10ft-double-door-container',
  '10ft-steel-floor-container',
  '10ft-wooden-floor-container',
  '10ft-shipping-container-16',
  '10ft-shipping-container-17',
  '10ft-shipping-container-18',
  '10ft-shipping-container-19',
  '10ft-shipping-container-20',
  '10ft-workshop-container',
  '10ft-high-cube-roll-up-door-container'
];
const fortyFootFolderSlugs = [
  '40ft-high-cube-open-side-1',
  '40ft-high-cube-open-side-2',
  '40ft-double-door-high-cube-1',
  '40ft-double-door-high-cube-2',
  '40ft-high-cube-refrigerated-container',
  '40ft-high-cube-container',
  '40ft-high-cube-open-side-3',
  '40ft-high-cube-open-side-4',
  '40ft-high-cube-side-door-1',
  '40ft-high-cube-side-door-2',
  '40ft-high-cube-side-door-3',
  '40ft-high-cube-side-door-4',
  '40ft-high-cube-used-container',
  '40ft-shipping-container-19',
  '40ft-shipping-container-20',
  '40ft-shipping-container-21',
  '40ft-side-door-container'
];
const fortyFiveFootFolderSlugs = [
  '45ft-high-cube-container-1',
  '45ft-high-cube-container-2',
  '45ft-high-cube-container-3',
  '45ft-high-cube-container-4',
  '45ft-high-cube-dry-container',
  '45ft-high-cube-container-5',
  '45ft-shipping-container-20',
  '45ft-shipping-container-21',
  '45ft-high-cube-one-trip-1',
  '45ft-high-cube-roll-up-doors',
  '45ft-one-trip-high-cube-1',
  '45ft-one-trip-high-cube-2',
  '45ft-one-trip-high-cube-3',
  '45ft-container-front-open',
  '45ft-container-side-closed',
  '45ft-container-side-open',
  '45ft-one-trip-container',
  '45ft-one-trip-cargo-door-open',
  '45ft-one-trip-roll-up-doors',
  '45ft-shipping-container-side-cut',
  '45ft-used-grade-a-blue-container',
  '45ft-shipping-container-roll-up-doors'
];
const fiftyThreeFootFolderSlugs = [
  '53ft-high-cube-side-opening-container',
  '53ft-high-cube-roll-up-door-container',
  '53ft-high-cube-side-and-end-door-container',
  '53ft-high-cube-container-1',
  '53ft-high-cube-container-2',
  '53ft-open-side-door-container',
  '53ft-retreat-cabin-container',
  '53ft-one-trip-shipping-container'
];
const feedbackListingSlugs = [
  '20ft-both-end-opening-doors',
  '20ft-all-side-opening-doors',
  '20ft-side-double-roll-up-doors',
  '20ft-roll-up-doors'
];
const lastContainerSlugs = [
  '20ft-open-side-door',
  '20ft-high-cube-open-side',
  '20ft-modified-canteen-unit',
  '20ft-open-side-container',
  '20ft-high-cube-full-open-side'
];

function getDatabaseTarget() {
  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    throw new Error('DATABASE_URL and DIRECT_URL must both be configured.');
  }

  const pooledUrl = new URL(process.env.DATABASE_URL);
  const directUrl = new URL(process.env.DIRECT_URL);
  if (pooledUrl.pathname !== directUrl.pathname) {
    throw new Error('DATABASE_URL and DIRECT_URL must point to the same database.');
  }

  return { host: directUrl.hostname, database: directUrl.pathname.slice(1) };
}

async function main() {
  const target = getDatabaseTarget();
  const inventory = buildContainerInventory().filter((item) =>
    (fiftyThreeFootFolderOnly
      ? item.size === 'FT53' && fiftyThreeFootFolderSlugs.includes(item.slug)
      : fortyFiveFootFolderOnly
        ? item.size === 'FT45' && fortyFiveFootFolderSlugs.includes(item.slug)
        : fortyFootFolderOnly
          ? item.size === 'FT40' && fortyFootFolderSlugs.includes(item.slug)
          : tenFootFolderOnly
            ? item.size === 'FT10' && tenFootFolderSlugs.includes(item.slug)
            : item.size === 'FT20')
    && (!lastContainersOnly || lastContainerSlugs.includes(item.slug))
    && (!feedbackListingsOnly || feedbackListingSlugs.includes(item.slug))
  );
  if (inventory.length === 0) {
    throw new Error('No 20ft listings were found in the catalog inventory.');
  }

  console.log(`Database target: ${target.database}@${target.host}`);
  const scope = fiftyThreeFootFolderOnly
    ? '53ft container folder'
    : fortyFiveFootFolderOnly
      ? '45ft containers folder'
      : fortyFootFolderOnly
        ? '40ft containers folder'
        : tenFootFolderOnly
          ? '10ft containers folder'
          : feedbackListingsOnly
            ? 'Feedback'
            : lastContainersOnly
              ? 'Last Containers'
              : '20ft';
  console.log(`${scope} listings to sync: ${inventory.length}.`);
  for (const item of inventory) {
    console.log(`${item.title} | $${item.price} | ${item.imagePaths.length} photos`);
  }

  if (!apply) {
    console.log(`Dry run only. To apply, pass --apply --confirm-target=${target.host}`);
    return;
  }

  if (confirmedTarget !== target.host) {
    throw new Error(`Refusing to modify the database. Confirm the direct database host with --confirm-target=${target.host}`);
  }

  await prisma.$transaction(inventory.map((item) => {
    const { imagePaths, ...productData } = item;
    const images = {
      deleteMany: {},
      create: imagePaths.map((publicId, sortOrder) => ({
        publicId,
        alt: productData.title,
        sortOrder
      }))
    };

    return prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        title: productData.title,
        size: productData.size,
        type: productData.type,
        condition: productData.condition,
        price: new Prisma.Decimal(productData.price),
        stockQuantity: productData.stockQuantity,
        location: productData.location,
        description: productData.description,
        featured: productData.featured,
        status: 'ACTIVE',
        images
      },
      create: {
        ...productData,
        status: 'ACTIVE',
        images: {
          create: imagePaths.map((publicId, sortOrder) => ({
            publicId,
            alt: productData.title,
            sortOrder
          }))
        }
      }
    });
  }));

  const synced = await prisma.product.findMany({
    where: { slug: { in: inventory.map((item) => item.slug) } },
    select: { slug: true, price: true, images: { select: { publicId: true }, orderBy: { sortOrder: 'asc' } } }
  });
  if (synced.length !== inventory.length) {
    throw new Error(`Post-sync verification failed: expected ${inventory.length} listings, found ${synced.length}.`);
  }
  const expectedBySlug = new Map(inventory.map((item) => [item.slug, item]));
  for (const product of synced) {
    const expected = expectedBySlug.get(product.slug);
    if (
      !expected
      || Number(product.price) !== expected.price
      || product.images.length !== expected.imagePaths.length
      || product.images.some((image, index) => image.publicId !== expected.imagePaths[index])
    ) {
      throw new Error(`Post-sync verification failed for ${product.slug}.`);
    }
  }

  console.log(`Synced and verified all ${synced.length} ${scope} listings.`);
}

main()
  .catch((error) => {
    console.error('20ft listing sync failed.', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
