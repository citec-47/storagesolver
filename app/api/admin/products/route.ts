import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({ slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/), title: z.string().min(2).max(160), size: z.enum(['FT10', 'FT20', 'FT40', 'FT45', 'FT53']), type: z.enum(['STANDARD', 'HIGH_CUBE', 'OPEN_TOP', 'FLAT_RACK', 'REEFER', 'SIDE_DOOR', 'OFFICE_MODIFIED']), condition: z.enum(['NEW', 'ONE_TRIP', 'CARGO_WORTHY', 'WIND_WATER_TIGHT', 'AS_IS']), price: z.number().nonnegative(), stockQuantity: z.number().int().nonnegative(), location: z.string().min(2).max(120), description: z.string().min(5), status: z.enum(['ACTIVE', 'DRAFT', 'SOLD_OUT']).default('DRAFT'), images: z.array(z.string().min(1).max(255)).default([]) });
export async function POST(request: Request) {
  if (!await getServerSession(authOptions) || !process.env.DATABASE_URL) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const product = schema.parse(await request.json());
    const { images, ...data } = product;
    const created = await prisma.product.create({ data: { ...data, images: { create: images.map((publicId, sortOrder) => ({ publicId, alt: data.title, sortOrder })) } } });
    revalidatePath('/containers');
    revalidatePath('/containers/[slug]', 'page');
    revalidatePath('/sitemap.xml');
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? error.flatten() : 'Could not create product.' }, { status: 400 }); }
}