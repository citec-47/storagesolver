import { conditionLabels, sizeLabels, typeLabels } from '@/lib/config';
import { buildContainerInventory } from '@/lib/container-inventory';
import { priceForContainerSize } from '@/lib/container-pricing';

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

export const demoProducts: CatalogProduct[] = buildContainerInventory().map((container, index) => ({
  id: `demo-${container.slug}`,
  slug: container.slug,
  title: container.title,
  size: container.size,
  type: container.type,
  condition: container.condition,
  grade: '',
  price: priceForContainerSize(container.size),
  stockQuantity: container.stockQuantity,
  location: container.location,
  featured: container.featured,
  status: 'ACTIVE',
  description: container.description,
  internalLength: '',
  internalWidth: '',
  internalHeight: '',
  externalLength: '',
  externalWidth: '',
  externalHeight: '',
  doorOpeningWidth: '',
  doorOpeningHeight: '',
  tareWeight: '',
  maxPayload: '',
  cubicCapacity: '',
  color: '',
  features: [],
  images: [{ id: `image-${container.slug}`, publicId: container.imagePath, alt: container.title, sortOrder: 0 }],
  createdAt: new Date(Date.now() - index * 86400000)
}));

export function productDisplay(product: CatalogProduct) {
  return {
    ...product,
    sizeLabel: sizeLabels[product.size] ?? product.size,
    typeLabel: typeLabels[product.type] ?? product.type,
    conditionLabel: conditionLabels[product.condition] ?? product.condition
  };
}