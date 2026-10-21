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
  const { publicId } = await request.json() as { publicId?: string };
  if (!publicId || !/^containers\/[a-z0-9-]+\/[a-zA-Z0-9_./-]+$/.test(publicId)) return NextResponse.json({ error: 'Invalid product image identifier.' }, { status: 400 });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash('sha1').update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`).digest('hex');
  const body = new URLSearchParams({ public_id: publicId, timestamp: String(timestamp), api_key: apiKey, signature });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: 'POST', body });
  const result = await response.json() as { result?: string; error?: { message?: string } };
  if (!response.ok || (result.result !== 'ok' && result.result !== 'not found')) return NextResponse.json({ error: result.error?.message ?? 'Cloudinary could not delete the image.' }, { status: 502 });
  return NextResponse.json({ success: true });
}