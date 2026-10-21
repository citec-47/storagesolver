import { NextResponse } from 'next/server';
import { containerPhotos } from '@/lib/container-photo-ids';

export async function GET(_: Request, { params }: { params: { index: string } }) {
  const index = Number(params.index);
  const photo = containerPhotos[index];
  if (!Number.isInteger(index) || !photo) {
    return NextResponse.json({ error: 'Container image not found.' }, { status: 404 });
  }

  return NextResponse.redirect(new URL(photo.file, process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'), {
    status: 307,
    headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' }
  });
}