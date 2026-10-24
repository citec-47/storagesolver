import { prisma } from '@/lib/prisma';
import { demoProducts, type CatalogProduct } from '@/lib/demo-data';
import { priceForContainerSize, type ContainerSize } from '@/lib/container-pricing';

const representativePhotos = {
  general: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Blue_and_grey_shipping_containers.jpg',
    credit: '1250metersdeep · CC0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Blue_and_grey_shipping_containers.jpg'
  }
} as const;

const localFallbackBySize: Record<string, string[]> = {
  FT10: Array.from({ length: 6 }, (_, index) => `/local-container-photos/10ft-${String(index + 1).padStart(2, '0')}.jpeg`),
  FT20: Array.from({ length: 8 }, (_, index) => `/local-container-photos/20ft-${String(index + 1).padStart(2, '0')}.jpeg`),
  FT40: Array.from({ length: 10 }, (_, index) => `/local-container-photos/40ft-${String(index + 1).padStart(2, '0')}.jpeg`),
  FT45: Array.from({ length: 6 }, (_, index) => `/local-container-photos/45ft-${String(index + 1).padStart(2, '0')}.jpeg`),
  FT53: Array.from({ length: 7 }, (_, index) => `/local-container-photos/53ft-${String(index + 1).padStart(2, '0')}.jpeg`)
};

const localFallbackPool = Object.values(localFallbackBySize).flat();

function pickFallbackImage(size: string, globalOffset = 0): string {
  const pool = localFallbackPool.length ? localFallbackPool : (localFallbackBySize[size] ?? []);
  if (!pool.length) return representativePhotos.general.url;
  return pool[globalOffset % pool.length];
}

function applyFallbackImage(product: CatalogProduct, fallbackSrc: string): CatalogProduct {
  const primary = product.images[0];
  const firstImage = {
    id: primary?.id ?? `${product.id}-fallback-image`,
    publicId: fallbackSrc,
    alt: primary?.alt ?? `${product.title} shipping container`,
    sortOrder: 0
  };
  const remainingImages = product.images.slice(1);
  return { ...product, images: [firstImage, ...remainingImages] };
}

export function assignRepresentativeImages(products: CatalogProduct[]): CatalogProduct[] {
  const seenPrimaryImageIds = new Map<string, number>();
  return products.map((product, index) => {
    const primary = product.images[0]?.publicId ?? '';
    const isPlaceholder = !primary || primary.includes('placeholder') || /^commons-container-(\d+)$/.test(primary);
    if (isPlaceholder) {
      return applyFallbackImage(product, pickFallbackImage(product.size, index));
    }

    const duplicateCount = seenPrimaryImageIds.get(primary) ?? 0;
    seenPrimaryImageIds.set(primary, duplicateCount + 1);
    if (duplicateCount > 0) {
      return applyFallbackImage(product, pickFallbackImage(product.size, index + duplicateCount));
    }
    return product;
  });
}

export function imageCredit(publicId: string) {
  const photoMatch = /^commons-container-(\d+)$/.exec(publicId);
  if (photoMatch) return undefined;
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
      price: priceForContainerSize(product.size as ContainerSize),
      salePrice: undefined,
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
  if (representativeMatch) return representativePhotos.general.url;
  if (!publicId) {
    return representativePhotos.general.url;
  }
  if (publicId.startsWith('/')) return publicId;

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