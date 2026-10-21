import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  if (!await getServerSession(authOptions)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!apiKey || !apiSecret || !cloudName) return NextResponse.json({ error: 'Cloudinary is not configured.' }, { status: 503 });
  const { slug } = await request.json() as { slug?: string };
  if (!slug || !/^[a-z0-9-]{2,120}$/.test(slug)) return NextResponse.json({ error: 'A valid product slug is required.' }, { status: 400 });
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `containers/${slug}`;
  const signature = createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest('hex');
  return NextResponse.json({ timestamp, folder, signature, apiKey, cloudName });
}