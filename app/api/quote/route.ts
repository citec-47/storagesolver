import { NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';
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
    const notificationRecipients = [process.env.ADMIN_EMAIL, siteConfig.email]
      .filter((email): email is string => Boolean(email));
    let emailDelivered = false;
    let emailStatusMessage: string | undefined;
    if (!process.env.MAIL_HOST || !process.env.MAIL_PORT || !process.env.MAIL_USER || !process.env.MAIL_PASSWORD || !process.env.MAIL_FROM_EMAIL) {
      emailStatusMessage = 'Quote saved, but email notifications are not configured (missing Hostinger SMTP settings).';
      console.error(emailStatusMessage);
    } else if (!notificationRecipients.length) {
      emailStatusMessage = 'Quote saved, but email notifications are not configured (no recipient email).';
      console.error(emailStatusMessage);
    } else {
      try {
        const mailPort = Number(process.env.MAIL_PORT);
        if (!Number.isInteger(mailPort) || mailPort <= 0) {
          throw new Error('MAIL_PORT must be a valid positive integer.');
        }
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: mailPort,
          secure: process.env.MAIL_SECURE !== 'false',
          auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD }
        });
        const fromAddress = process.env.MAIL_FROM_EMAIL;
        const itemLines = items.map((item) => `${item.quantity} × ${item.slug}`).join('\n');
        const customerMessage = `Hi ${payload.name},

Thank you for requesting a container quote from ${siteConfig.name}.

Our team has received your request and will review the details. An administrator will get back to you shortly with availability, delivery information, and pricing.

Best regards,
${siteConfig.name} Team`;
        await Promise.all([
          transporter.sendMail({ from: fromAddress, to: notificationRecipients, replyTo: payload.email, subject: `New container quote request from ${payload.name}`, text: `${payload.name} · ${payload.email} · ${payload.phone}\n${itemLines}\n${payload.message ?? ''}` }),
          transporter.sendMail({ from: fromAddress, to: payload.email, subject: `We received your quote request - ${siteConfig.name}`, text: customerMessage })
        ]);
        emailDelivered = true;
      } catch (error) {
        emailStatusMessage = 'Quote saved, but email delivery failed.';
        console.error(emailStatusMessage, error);
      }
    }
    return NextResponse.json({ success: true, demo: !process.env.DATABASE_URL, emailDelivered, emailStatusMessage });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Please check the form fields and try again.' }, { status: 400 });
    console.error('Quote request failed', error);
    return NextResponse.json({ error: 'We could not submit your request right now. Please call our team.' }, { status: 500 });
  }
}