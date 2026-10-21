import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({ status: z.enum(['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST']), internalNotes: z.string().max(10000) });
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!await getServerSession(authOptions)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { const data = schema.parse(await request.json()); await prisma.inquiry.update({ where: { id: params.id }, data }); return NextResponse.json({ success: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? error.flatten() : 'Could not update inquiry.' }, { status: 400 }); }
}