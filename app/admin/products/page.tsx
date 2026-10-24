import { prisma } from '@/lib/prisma';
import { demoProducts } from '@/lib/demo-data';
import { conditionLabels, sizeLabels, typeLabels } from '@/lib/config';
import { formatPrice } from '@/lib/products';
import { priceForContainerSize, type ContainerSize } from '@/lib/container-pricing';
import { AdminProducts } from '@/components/admin-products';

export default async function AdminProductsPage() {
  let products = demoProducts;
  if (process.env.DATABASE_URL) {
    try { products = await prisma.product.findMany({ include: { images: { orderBy: { sortOrder: 'asc' } } }, orderBy: { updatedAt: 'desc' } }).then((rows) => rows.map((row) => ({ ...row, price: priceForContainerSize(row.size as ContainerSize), salePrice: undefined, grade: row.grade ?? '—', internalLength: row.internalLength ?? '', internalWidth: row.internalWidth ?? '', internalHeight: row.internalHeight ?? '', externalLength: row.externalLength ?? '', externalWidth: row.externalWidth ?? '', externalHeight: row.externalHeight ?? '', doorOpeningWidth: row.doorOpeningWidth ?? '', doorOpeningHeight: row.doorOpeningHeight ?? '', tareWeight: row.tareWeight ?? '', maxPayload: row.maxPayload ?? '', cubicCapacity: row.cubicCapacity ?? '', color: row.color ?? '' }))); } catch (error) { console.error('Unable to load products', error); }
  }
  return <><p className="eyebrow">Catalog control</p><h1 className="display-font mt-1 text-4xl font-bold uppercase">Products</h1><div className="mt-6"><AdminProducts products={products.map((product) => ({ id: product.id, slug: product.slug, title: product.title, size: product.size as ContainerSize, type: product.type, condition: product.condition, stockQuantity: product.stockQuantity, price: product.price, status: product.status, location: product.location, description: product.description, images: product.images.map((image) => image.publicId) }))} /></div></>;
}