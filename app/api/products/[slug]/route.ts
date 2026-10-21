import { NextResponse } from 'next/server';
import { conditionLabels, sizeLabels, typeLabels } from '@/lib/config';
import { getProductBySlug, getProducts, imageCredit, imageUrl } from '@/lib/products';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return NextResponse.json({ error: 'Container not found.' }, { status: 404 });
  }

  const related = (await getProducts())
    .filter((item) => item.size === product.size && item.id !== product.id)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      size: item.size,
      price: item.price,
      salePrice: item.salePrice ?? null,
      stockQuantity: item.stockQuantity,
      location: item.location,
      image: imageUrl(item.images[0]?.publicId ?? '', 700),
      condition: item.condition
    }));

  return NextResponse.json({
    id: product.id,
    slug: product.slug,
    title: product.title,
    size: product.size,
    sizeLabel: sizeLabels[product.size] ?? product.size,
    type: product.type,
    typeLabel: typeLabels[product.type] ?? product.type,
    condition: product.condition,
    conditionLabel: conditionLabels[product.condition] ?? product.condition,
    grade: product.grade,
    price: product.price,
    salePrice: product.salePrice ?? null,
    stockQuantity: product.stockQuantity,
    location: product.location,
    description: product.description,
    features: product.features,
    mainImage: imageUrl(product.images[0]?.publicId ?? '', 1400),
    imageCredit: imageCredit(product.images[0]?.publicId ?? '') ?? null,
    images: product.images.map((image) => ({
      id: image.id,
      publicId: image.publicId,
      alt: image.alt,
      sortOrder: image.sortOrder,
      url: imageUrl(image.publicId, 1400),
      credit: imageCredit(image.publicId) ?? null
    })),
    dimensions: {
      internalLength: product.internalLength,
      internalWidth: product.internalWidth,
      internalHeight: product.internalHeight,
      externalLength: product.externalLength,
      externalWidth: product.externalWidth,
      externalHeight: product.externalHeight,
      doorOpeningWidth: product.doorOpeningWidth,
      doorOpeningHeight: product.doorOpeningHeight,
      tareWeight: product.tareWeight,
      maxPayload: product.maxPayload,
      cubicCapacity: product.cubicCapacity
    },
    related
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
