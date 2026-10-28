import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { imageUrl } from '@/lib/products';
import type { ContainerSize } from '@/lib/container-pricing';
import { AdminProducts } from '@/components/admin-products';

type AdminProductRecord = Prisma.ProductGetPayload<{ include: { images: true } }>;

export default async function AdminProductsPage() {
  let products: AdminProductRecord[] = [];
  let loadError: string | undefined;
  if (!process.env.DATABASE_URL) {
    loadError = 'The catalog database is not configured. Add DATABASE_URL to the server environment to manage products.';
  } else {
    try {
      products = await prisma.product.findMany({
        include: { images: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
      console.error('Unable to load products', error);
      loadError = 'Could not load the live catalog. Check the database connection and refresh this page.';
    }
  }
  return <><p className="eyebrow">Catalog control</p><h1 className="display-font mt-1 text-4xl font-bold uppercase">Products</h1><div className="mt-6"><AdminProducts loadError={loadError} products={products.map((product) => ({ id: product.id, slug: product.slug, title: product.title, size: product.size as ContainerSize, type: product.type, condition: product.condition, stockQuantity: product.stockQuantity, price: Number(product.price), status: product.status, location: product.location, description: product.description, images: product.images.map((image) => ({ publicId: image.publicId, url: imageUrl(image.publicId, 320) })) }))} /></div></>;
}