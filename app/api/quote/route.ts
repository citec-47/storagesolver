import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/config';
import { getProducts, imageUrl } from '@/lib/products';

const quoteSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30),
  company: z.string().trim().max(120).optional(),
  deliveryAddress: z.string().trim().max(240).optional(),
  deliveryZip: z.string().trim().max(20).optional(),
  size: z.string().max(20).optional(),
  quantity: z.coerce.number().int().min(1).max(100).default(1),
  condition: z.string().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
  items: z.array(z.object({ slug: z.string().max(120), quantity: z.number().int().min(1).max(100) })).max(30).default([]),
  website: z.string().max(0).optional()
});

export async function POST(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now();
  const bucket = (globalThis as typeof globalThis & { quoteLimits?: Map<string, number[]> }).quoteLimits ?? new Map<string, number[]>();
  const recent = (bucket.get(forwarded) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 5) return NextResponse.json({ error: 'Please wait a minute before sending another request.' }, { status: 429 });
  recent.push(now);
  bucket.set(forwarded, recent);
  (globalThis as typeof globalThis & { quoteLimits?: Map<string, number[]> }).quoteLimits = bucket;

  try {
    const payload = quoteSchema.parse(await request.json());
    if (payload.website) return NextResponse.json({ success: true });
    const items = payload.items.length ? payload.items : [{ slug: payload.size || 'general', quantity: payload.quantity }];
    const products = await getProducts();
    const productBySlug = new Map(products.map((product) => [product.slug, product]));
    const inquiryItems = items.map((item) => {
      const product = productBySlug.get(item.slug);
      return product ? {
        ...item,
        title: product.title,
        imageUrl: imageUrl(product.images[0]?.publicId ?? '', 900),
        productUrl: `/containers/${product.slug}`
      } : item;
    });
    if (process.env.DATABASE_URL) {
      await prisma.inquiry.create({ data: {
        name: payload.name, email: payload.email, phone: payload.phone,
        company: payload.company || null, deliveryAddress: payload.deliveryAddress || null,
        deliveryZip: payload.deliveryZip || null, message: payload.message || null, items: inquiryItems
      } });
    }
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const itemLines = items.map((item) => `${item.quantity} × ${item.slug}`).join('\n');
        const notifications = await Promise.all([
          resend.emails.send({ from: `${siteConfig.name} <quotes@${new URL(siteConfig.url).hostname}>`, to: process.env.ADMIN_EMAIL, subject: `New container quote request from ${payload.name}`, text: `${payload.name} · ${payload.email} · ${payload.phone}\n${itemLines}\n${payload.message ?? ''}` }),
          resend.emails.send({ from: `${siteConfig.name} <quotes@${new URL(siteConfig.url).hostname}>`, to: payload.email, subject: 'We received your container quote request', text: `Hi ${payload.name},\n\nThanks for reaching out. Our team will review your request and follow up shortly.\n\n${siteConfig.name}` })
        ]);
        if (notifications.some((notification) => notification.error)) console.error('Quote saved, but one or more email notifications failed.', notifications.map((notification) => notification.error));
      } catch (error) {
        console.error('Quote saved, but email notifications failed.', error);
      }
    }
    return NextResponse.json({ success: true, demo: !process.env.DATABASE_URL });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Please check the form fields and try again.' }, { status: 400 });
    console.error('Quote request failed', error);
    return NextResponse.json({ error: 'We could not submit your request right now. Please call our team.' }, { status: 500 });
  }
}