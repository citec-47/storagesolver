import { NextResponse } from 'next/server';
import { ContainerCondition, ContainerSize, ContainerType, Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { CatalogProduct } from '@/lib/demo-data';
import { assignRepresentativeImages, getDemoProducts, imageCredit, imageUrl } from '@/lib/products';

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

  let products: CatalogProduct[] = getDemoProducts();
  let usingDemoData = !process.env.DATABASE_URL;
  if (process.env.DATABASE_URL) {
    try {
      const conditionFilters: Prisma.ProductWhereInput[] = [];
      if (filters.condition) conditionFilters.push({ condition: filters.condition });
      if (filters.availability === 'new') conditionFilters.push({ condition: { in: [ContainerCondition.NEW, ContainerCondition.ONE_TRIP] } });
      if (filters.availability === 'used') conditionFilters.push({ condition: { in: [ContainerCondition.CARGO_WORTHY, ContainerCondition.WIND_WATER_TIGHT, ContainerCondition.AS_IS] } });
      const where: Prisma.ProductWhereInput = {
        status: 'ACTIVE',
        ...(filters.size ? { size: filters.size } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(conditionFilters.length ? { AND: conditionFilters } : {}),
        ...(filters.location ? { location: { contains: filters.location, mode: 'insensitive' } } : {}),
        ...(filters.q ? { OR: [{ title: { contains: filters.q, mode: 'insensitive' } }, { description: { contains: filters.q, mode: 'insensitive' } }, { location: { contains: filters.q, mode: 'insensitive' } }] } : {}),
        ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) ? { price: { ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}), ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}) } } : {})
      };
      const records = await prisma.product.findMany({ where, include: { images: { orderBy: { sortOrder: 'asc' } } }, orderBy: filters.sort === 'price-asc' ? { price: 'asc' } : filters.sort === 'price-desc' ? { price: 'desc' } : { createdAt: 'desc' } });
      products = assignRepresentativeImages(records.map((product) => ({
        ...product,
        grade: product.grade ?? '',
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : undefined,
        internalLength: product.internalLength ?? '', internalWidth: product.internalWidth ?? '', internalHeight: product.internalHeight ?? '',
        externalLength: product.externalLength ?? '', externalWidth: product.externalWidth ?? '', externalHeight: product.externalHeight ?? '',
        doorOpeningWidth: product.doorOpeningWidth ?? '', doorOpeningHeight: product.doorOpeningHeight ?? '',
        tareWeight: product.tareWeight ?? '', maxPayload: product.maxPayload ?? '', cubicCapacity: product.cubicCapacity ?? '', color: product.color ?? ''
      })));
    } catch (error) {
      console.error('Inventory API database query failed.', error instanceof Error ? error.message : 'unknown error');
      usingDemoData = true;
    }
  }

  if (usingDemoData) {
    products = products.filter((product) =>
      (!filters.size || product.size === filters.size) &&
      (!filters.type || product.type === filters.type) &&
      (!filters.condition || product.condition === filters.condition) &&
      (filters.availability === 'all' || (filters.availability === 'new' ? ['NEW', 'ONE_TRIP'].includes(product.condition) : ['CARGO_WORTHY', 'WIND_WATER_TIGHT', 'AS_IS'].includes(product.condition))) &&
      (!filters.location || product.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.q || `${product.title} ${product.description} ${product.location}`.toLowerCase().includes(filters.q.toLowerCase())) &&
      (filters.minPrice === undefined || product.price >= filters.minPrice) &&
      (filters.maxPrice === undefined || product.price <= filters.maxPrice)
    );
    if (filters.sort === 'price-asc') products.sort((a, b) => a.price - b.price);
    if (filters.sort === 'price-desc') products.sort((a, b) => b.price - a.price);
    if (filters.sort === 'newest') products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

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