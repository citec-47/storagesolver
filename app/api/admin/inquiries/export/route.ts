import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function csv(value: unknown) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }
export async function GET() {
  if (!await getServerSession(authOptions)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });
  const rows = [['id', 'name', 'email', 'phone', 'company', 'deliveryAddress', 'deliveryZip', 'status', 'createdAt', 'message'], ...inquiries.map((item) => [item.id, item.name, item.email, item.phone, item.company, item.deliveryAddress, item.deliveryZip, item.status, item.createdAt.toISOString(), item.message])];
  return new NextResponse(rows.map((row) => row.map(csv).join(',')).join('\r\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="storage-solvers-inquiries.csv"' } });
}