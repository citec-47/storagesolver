import { PrismaClient, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { buildContainerInventory, retiredContainerSlugs } from '../lib/container-inventory';

const prisma = new PrismaClient();

const inventory = buildContainerInventory();

async function main() {
  await prisma.product.deleteMany({ where: { slug: { in: retiredContainerSlugs } } });

  for (const item of inventory) {
    const { imagePaths, ...productData } = item;
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        ...productData,
        status: ProductStatus.ACTIVE,
        grade: null,
        salePrice: null,
        internalLength: null,
        internalWidth: null,
        internalHeight: null,
        externalLength: null,
        externalWidth: null,
        externalHeight: null,
        doorOpeningWidth: null,
        doorOpeningHeight: null,
        tareWeight: null,
        maxPayload: null,
        cubicCapacity: null,
        color: null,
        features: [],
        images: {
          deleteMany: {},
          create: imagePaths.map((publicId, sortOrder) => ({ publicId, alt: productData.title, sortOrder }))
        }
      },
      create: {
        ...productData,
        status: ProductStatus.ACTIVE,
        images: {
          create: imagePaths.map((publicId, sortOrder) => ({ publicId, alt: productData.title, sortOrder }))
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