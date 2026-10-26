import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { loadEnvConfig } from '@next/env';
import { PrismaClient, type Prisma } from '@prisma/client';
import { buildContainerInventory, containerPhotoGroups } from '../lib/container-inventory';

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');
const confirmedTarget = process.argv.find((argument) => argument.startsWith('--confirm-target='))?.split('=')[1];
const root = process.cwd();

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

async function copyContainerPhotos() {
  const copies: { source: string; destination: string }[] = [];
  for (const group of containerPhotoGroups) {
    const sourceDirectory = path.join(root, 'New containers', group.folder);
    const photoNames = (await readdir(sourceDirectory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && /\.jpe?g$/i.test(entry.name))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right, 'en', { numeric: true }));

    if (photoNames.length !== group.sourceCount) {
      throw new Error(`${group.folder} contains ${photoNames.length} JPEGs; expected ${group.sourceCount}. No database changes were made.`);
    }

    for (const photoNumber of group.photoNumbers) {
      const photoName = photoNames.find((name) => new RegExp(`^c${photoNumber}\\.jpe?g$`, 'i').test(name));
      if (!photoName) {
        throw new Error(`${group.folder} is missing source photo c${photoNumber}. No database changes were made.`);
      }
      const number = String(photoNumber).padStart(2, '0');
      copies.push({
        source: path.join(sourceDirectory, photoName),
        destination: path.join(root, 'public', 'local-container-photos', `${group.feet}ft-${number}.jpeg`)
      });
    }
  }

  await mkdir(path.join(root, 'public', 'local-container-photos'), { recursive: true });
  await Promise.all(copies.map(({ source, destination }) => copyFile(source, destination)));
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Inventory replacement is disabled when NODE_ENV=production.');
  }

  const target = getDatabaseTarget();
  const inventory = buildContainerInventory();
  const [existingProducts, existingImages] = await Promise.all([
    prisma.product.count(),
    prisma.productImage.count()
  ]);

  console.log(`Database target: ${target.database}@${target.host}`);
  console.log(`Current rows: ${existingProducts} products, ${existingImages} product images.`);
  console.log(`Replacement: ${inventory.length} listings and ${inventory.length} local photos.`);
  console.log('Admin users, inquiries, and inquiry items are retained.');

  if (!apply) {
    console.log(`Dry run only. To apply, pass --apply --confirm-target=${target.host}`);
    return;
  }

  if (confirmedTarget !== target.host) {
    throw new Error(`Refusing to modify the database. Confirm the direct database host with --confirm-target=${target.host}`);
  }

  await copyContainerPhotos();

  const now = new Date();
  const records = inventory.map((container) => ({ container, id: randomUUID() }));
  const products: Prisma.ProductCreateManyInput[] = records.map(({ container, id }) => {
    return {
      id,
      slug: container.slug,
      title: container.title,
      size: container.size,
      type: container.type,
      condition: container.condition,
      price: container.price,
      stockQuantity: container.stockQuantity,
      location: container.location,
      description: container.description,
      featured: container.featured,
      status: 'ACTIVE',
      features: [],
      createdAt: now,
      updatedAt: now
    };
  });
  const images: Prisma.ProductImageCreateManyInput[] = records.flatMap(({ container, id: productId }) =>
    container.imagePaths.map((publicId, sortOrder) => ({
      id: randomUUID(),
      productId,
      publicId,
      alt: container.title,
      sortOrder
    }))
  );

  await prisma.$transaction([
    prisma.product.deleteMany(),
    prisma.product.createMany({ data: products }),
    prisma.productImage.createMany({ data: images })
  ]);

  const [createdProducts, createdImages] = await Promise.all([
    prisma.product.findMany({
      select: {
        slug: true,
        size: true,
        price: true,
        location: true,
        images: { select: { publicId: true } }
      }
    }),
    prisma.productImage.count()
  ]);
  if (createdProducts.length !== inventory.length || createdImages !== inventory.length) {
    throw new Error(`Post-import verification failed: found ${createdProducts.length} products and ${createdImages} images.`);
  }

  const expectedBySlug = new Map(inventory.map((container) => [container.slug, container]));
  for (const product of createdProducts) {
    const expected = expectedBySlug.get(product.slug);
    if (
      !expected
      || product.size !== expected.size
      || Number(product.price) !== expected.price
      || product.location !== expected.location
      || product.images.length !== expected.imagePaths.length
      || product.images.some((image, index) => image.publicId !== expected.imagePaths[index])
    ) {
      throw new Error(`Post-import verification found an unexpected listing: ${product.slug}.`);
    }
  }

  const countsBySize = createdProducts.reduce<Record<string, number>>((counts, product) => {
    counts[product.size] = (counts[product.size] ?? 0) + 1;
    return counts;
  }, {});
  console.log(`New container inventory imported and verified: ${JSON.stringify(countsBySize)}.`);
}

main()
  .catch((error) => {
    console.error('Container inventory replacement failed.', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
