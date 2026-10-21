import { prisma } from '@/lib/prisma';
import { demoProducts, type CatalogProduct } from '@/lib/demo-data';
import { containerPhotos } from '@/lib/container-photo-ids';

const representativePhotos = {
  twentyFoot: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/03/20_Foot_Shipping_Container_Storage_Yard.jpg',
    credit: 'IPLManagement · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:20_Foot_Shipping_Container_Storage_Yard.jpg'
  },
  highCube: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/45_High_Cube_Shipping_Container_at_Yard.jpg',
    credit: 'IPLManagement · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:45_High_Cube_Shipping_Container_at_Yard.jpg'
  },
  general: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Blue_and_grey_shipping_containers.jpg',
    credit: '1250metersdeep · CC0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Blue_and_grey_shipping_containers.jpg'
  }
} as const;

const additionalCatalogSlugs = [
  '10ft-one-trip-standard',
  '10ft-used-cargo-worthy',
  '20ft-one-trip-standard',
  '20ft-used-watertight',
  '40ft-high-cube-cargo-worthy',
  '40ft-one-trip-standard',
  '45ft-high-cube-one-trip',
  '45ft-high-cube-used',
  '53ft-high-cube-cargo-worthy',
  '53ft-high-cube-one-trip'
];

export function assignRepresentativeImages(products: CatalogProduct[]): CatalogProduct[] {
  const stableIndices = new Map(demoProducts.map((product, index) => [product.slug, index]));
  additionalCatalogSlugs.forEach((slug, index) => stableIndices.set(slug, demoProducts.length + index));

  return products.map((product) => ({
    ...product,
    images: product.images.map((image) => {
      if (!image.publicId.includes('placeholder')) return image;
      const index = stableIndices.get(product.slug);
      return index === undefined || index >= containerPhotos.length
        ? image
        : { ...image, publicId: `commons-container-${index}` };
    })
  }));
}

export function imageCredit(publicId: string) {
  const photoMatch = /^commons-container-(\d+)$/.exec(publicId);
  if (photoMatch) {
    const photo = containerPhotos[Number(photoMatch[1])];
    return photo ? {
      credit: `${photo.artist} · ${photo.license}`,
      creditUrl: photo.sourceUrl
    } : undefined;
  }
  if (publicId && !publicId.includes('placeholder')) return undefined;
  const { credit, creditUrl } = representativePhotos.general;
  return { credit, creditUrl };
}

export function getDemoProducts(): CatalogProduct[] {
  return assignRepresentativeImages(demoProducts);
}

export async function getProducts(): Promise<CatalogProduct[]> {
  if (!process.env.DATABASE_URL) return getDemoProducts();
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' }, include: { images: { orderBy: { sortOrder: 'asc' } } }, orderBy: { createdAt: 'desc' }
    });
    const catalog = products.map((product) => ({
      ...product,
      grade: product.grade ?? '—',
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : undefined,
      internalLength: product.internalLength ?? '',
      internalWidth: product.internalWidth ?? '',
      internalHeight: product.internalHeight ?? '',
      externalLength: product.externalLength ?? '',
      externalWidth: product.externalWidth ?? '',
      externalHeight: product.externalHeight ?? '',
      doorOpeningWidth: product.doorOpeningWidth ?? '',
      doorOpeningHeight: product.doorOpeningHeight ?? '',
      tareWeight: product.tareWeight ?? '',
      maxPayload: product.maxPayload ?? '',
      cubicCapacity: product.cubicCapacity ?? '',
      color: product.color ?? '',
      createdAt: product.createdAt
    }));
    return assignRepresentativeImages(catalog);
  } catch (error) {
    console.error('Catalog database unavailable; using demo inventory.', error instanceof Error ? error.message : error);
    return getDemoProducts();
  }
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | undefined> {
  return (await getProducts()).find((product) => product.slug === slug);
}

export function imageUrl(publicId: string, width = 900): string {
  const representativeMatch = /^commons-container-(\d+)$/.exec(publicId);
  if (representativeMatch) return containerPhotos[Number(representativeMatch[1])]?.file ?? representativePhotos.general.url;
  if (!publicId) {
    return representativePhotos.general.url;
  }

  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    const separator = publicId.includes('?') ? '&' : '?';
    return `${publicId}${separator}auto=format&fit=crop&w=${width}&q=80`;
  }

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloud && !publicId.includes('placeholder')) {
    return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_${width},c_limit/${publicId}`;
  }

  return representativePhotos.general.url;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}