import 'dotenv/config';
import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

function isLegacyPublicId(publicId: string): boolean {
  return /^commons-container-\d+$/.test(publicId)
    || /^containers\/[a-z0-9-]+\/main-placeholder$/.test(publicId);
}

async function destroyCloudinaryAsset(publicId: string): Promise<void> {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!apiKey || !apiSecret || !cloudName || publicId.startsWith('commons-container-')) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature
  });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body
  });
  const result = await response.json() as { result?: string; error?: { message?: string } };
  if (!response.ok || (result.result !== 'ok' && result.result !== 'not found')) {
    throw new Error(result.error?.message ?? `Cloudinary rejected deletion for ${publicId}.`);
  }
}

async function main() {
  const images = await prisma.productImage.findMany({
    where: { OR: [{ publicId: { startsWith: 'commons-container-' } }, { publicId: { endsWith: '/main-placeholder' } }] },
    select: { id: true, productId: true, publicId: true },
    orderBy: { publicId: 'asc' }
  });
  const legacyImages = images.filter((image) => isLegacyPublicId(image.publicId));
  console.log(`Found ${legacyImages.length} legacy image record(s).`);
  for (const image of legacyImages) console.log(`- ${image.publicId}`);

  if (!apply) {
    console.log('Dry run only. Re-run with --apply to delete these database records and matching Cloudinary assets.');
    return;
  }

  for (const image of legacyImages) await destroyCloudinaryAsset(image.publicId);
  if (legacyImages.length) {
    await prisma.productImage.deleteMany({ where: { id: { in: legacyImages.map((image) => image.id) } } });
  }
  console.log(`Deleted ${legacyImages.length} legacy image record(s).`);
}

main()
  .catch((error) => {
    console.error('Legacy image cleanup failed', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
