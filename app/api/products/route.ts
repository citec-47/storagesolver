import { NextResponse } from 'next/server';
import { ContainerCondition, ContainerSize, ContainerType } from '@prisma/client';
import { z } from 'zod';
import { getProducts, imageCredit, imageUrl } from '@/lib/products';

const querySchema = z.object({
  size: z.nativeEnum(ContainerSize).optional(),
  type: z.nativeEnum(ContainerType).optional(),
  condition: z.nativeEnum(ContainerCondition).optional(),
  availability: z.enum(['new', 'used', 'all']).default('all'),
  sort: z.enum(['newest', 'price-asc', 'price-desc']).default('newest'),
  location: z.string().trim().max(100).optional(),
  q: z.string().trim().max(120).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24)
});

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid inventory filters.', details: parsed.error.flatten() }, { status: 400 });
  const filters = parsed.data;
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice) {
    return NextResponse.json({ error: 'minPrice must be less than or equal to maxPrice.' }, { status: 400 });
  }

  const products = (await getProducts()).filter((product) =>
    (!filters.size || product.size === filters.size) &&
    (!filters.type || product.type === filters.type) &&
    (!filters.condition || product.condition === filters.condition) &&
    (filters.availability === 'all' || (filters.availability === 'new'
      ? product.condition === ContainerCondition.NEW || product.condition === ContainerCondition.ONE_TRIP
      : product.condition === ContainerCondition.CARGO_WORTHY || product.condition === ContainerCondition.WIND_WATER_TIGHT || product.condition === ContainerCondition.AS_IS)) &&
    (!filters.location || product.location.toLowerCase().includes(filters.location.toLowerCase())) &&
    (!filters.q || `${product.title} ${product.description} ${product.location}`.toLowerCase().includes(filters.q.toLowerCase())) &&
    (filters.minPrice === undefined || product.price >= filters.minPrice) &&
    (filters.maxPrice === undefined || product.price <= filters.maxPrice)
  );
  if (filters.sort === 'price-asc') products.sort((a, b) => a.price - b.price);
  if (filters.sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  if (filters.sort === 'newest') products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = products.length;
  const offset = (filters.page - 1) * filters.limit;
  const data = products.slice(offset, offset + filters.limit).map((product) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    size: product.size,
    type: product.type,
    condition: product.condition,
    price: product.price,
    salePrice: product.salePrice ?? null,
    stockQuantity: product.stockQuantity,
    location: product.location,
    description: product.description,
    images: product.images.map((image) => ({ publicId: image.publicId, url: imageUrl(image.publicId, 900), alt: image.alt, credit: imageCredit(image.publicId) ?? null }))
  }));
  return NextResponse.json({ data, pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) } }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}