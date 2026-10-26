import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({ status: z.enum(['ACTIVE', 'DRAFT', 'SOLD_OUT']).optional(), stockQuantity: z.number().int().nonnegative().optional(), price: z.number().nonnegative().optional(), title: z.string().min(2).max(160).optional(), location: z.string().max(120).optional(), description: z.string().min(5).optional(), slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/).optional(), size: z.enum(['FT10', 'FT20', 'FT40', 'FT45', 'FT53']).optional(), type: z.enum(['STANDARD', 'HIGH_CUBE', 'OPEN_TOP', 'FLAT_RACK', 'REEFER', 'SIDE_DOOR', 'OFFICE_MODIFIED']).optional(), condition: z.enum(['NEW', 'ONE_TRIP', 'CARGO_WORTHY', 'WIND_WATER_TIGHT', 'AS_IS']).optional(), images: z.array(z.string().min(1).max(255)).optional() }).refine((data) => Object.keys(data).length > 0);
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!await getServerSession(authOptions)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = schema.parse(await request.json());
    const { images, ...fields } = data;
    const updateFields = fields;
    if (images) {
      await prisma.$transaction([
        prisma.product.update({ where: { id: params.id }, data: updateFields }),
        prisma.productImage.deleteMany({ where: { productId: params.id } }),
        prisma.productImage.createMany({ data: images.map((publicId, sortOrder) => ({ productId: params.id, publicId, alt: fields.title ?? 'Shipping container', sortOrder })) })
      ]);
    } else {
      await prisma.product.update({ where: { id: params.id }, data: updateFields });
    }
    revalidatePath('/containers');
    revalidatePath('/containers/[slug]', 'page');
    revalidatePath('/sitemap.xml');
    return NextResponse.json({ success: true });
  }
  catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? error.flatten() : 'Could not update product.' }, { status: 400 }); }
}
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!await getServerSession(authOptions)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await prisma.product.delete({ where: { id: params.id } }); revalidatePath('/containers'); revalidatePath('/containers/[slug]', 'page'); revalidatePath('/sitemap.xml'); return NextResponse.json({ success: true }); }
  catch { return NextResponse.json({ error: 'Could not delete product.' }, { status: 400 }); }
}