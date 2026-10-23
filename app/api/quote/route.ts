import { NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/config';
import { getProducts, imageUrl } from '@/lib/products';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character] ?? character);
}

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
    const notificationRecipients = (process.env.ADMIN_QUOTE_EMAILS || 'info@storagesolversinc.com,storangesolver@gmail.com')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);
    let emailDelivered = false;
    let adminEmailDelivered = false;
    let customerEmailDelivered = false;
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
          requireTLS: process.env.MAIL_SECURE === 'false',
          connectionTimeout: 15000,
          greetingTimeout: 15000,
          socketTimeout: 20000,
          auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD }
        });
        const fromAddress = process.env.MAIL_FROM_EMAIL;
        const itemLines = items.map((item) => `${item.quantity} × ${item.slug}`).join('\n');
        const adminMessage = `New container quote request

Customer: ${payload.name}
Email: ${payload.email}
Phone: ${payload.phone}
Company: ${payload.company || 'Not provided'}
Delivery address: ${payload.deliveryAddress || 'Not provided'}
Delivery ZIP: ${payload.deliveryZip || 'Not provided'}
Container size: ${payload.size || 'Not specified'}
Quantity: ${payload.quantity}
Condition: ${payload.condition || 'Not specified'}
Requested items:
${itemLines}

Customer message:
${payload.message || 'Not provided'}`;
        const customerMessage = `Hi ${payload.name},

Thank you for requesting a container quote from ${siteConfig.name}.

Our team has received your request. An administrator will review the details and get back to you shortly with availability, delivery information, and pricing.

Best regards,
${siteConfig.name} Team`;
        const safe = {
          name: escapeHtml(payload.name),
          email: escapeHtml(payload.email),
          phone: escapeHtml(payload.phone),
          company: escapeHtml(payload.company || 'Not provided'),
          address: escapeHtml(payload.deliveryAddress || 'Not provided'),
          zip: escapeHtml(payload.deliveryZip || 'Not provided'),
          size: escapeHtml(payload.size || 'Not specified'),
          condition: escapeHtml(payload.condition || 'Not specified'),
          message: escapeHtml(payload.message || 'Not provided'),
          items: escapeHtml(itemLines).replace(/\n/g, '<br>')
        };
        const emailShell = (content: string) => `
          <div style="margin:0;background:#f4f5f3;padding:32px 16px;font-family:Arial,sans-serif;color:#18201d">
            <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #dfe4df">
              <div style="background:#18201d;padding:24px 28px;color:#fff">
                <div style="font-size:12px;letter-spacing:2px;color:#b7d46a;font-weight:bold">STORAGE SOLVERS INC.</div>
                <div style="margin-top:8px;font-size:22px;font-weight:bold">Container solutions, delivered.</div>
              </div>
              <div style="padding:28px">${content}</div>
              <div style="border-top:1px solid #e6e9e6;padding:18px 28px;color:#68736e;font-size:12px;line-height:1.6">
                STORAGE SOLVERS INC. · ${escapeHtml(siteConfig.phone)}<br>
                ${escapeHtml(siteConfig.email)}
              </div>
            </div>
          </div>`;
        const adminHtml = emailShell(`
          <h1 style="margin:0 0 8px;font-size:24px;color:#18201d">New quote request</h1>
          <p style="margin:0 0 24px;color:#68736e">A new request has been submitted through the website.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:10px 0;color:#68736e;width:38%">Customer</td><td style="padding:10px 0;font-weight:bold">${safe.name}</td></tr>
            <tr><td style="padding:10px 0;color:#68736e">Email</td><td style="padding:10px 0">${safe.email}</td></tr>
            <tr><td style="padding:10px 0;color:#68736e">Phone</td><td style="padding:10px 0">${safe.phone}</td></tr>
            <tr><td style="padding:10px 0;color:#68736e">Company</td><td style="padding:10px 0">${safe.company}</td></tr>
            <tr><td style="padding:10px 0;color:#68736e">Delivery</td><td style="padding:10px 0">${safe.address} · ${safe.zip}</td></tr>
            <tr><td style="padding:10px 0;color:#68736e">Container</td><td style="padding:10px 0">${safe.size} · ${payload.quantity} unit(s)</td></tr>
            <tr><td style="padding:10px 0;color:#68736e">Condition</td><td style="padding:10px 0">${safe.condition}</td></tr>
          </table>
          <div style="margin-top:22px;padding:16px;background:#f4f5f3;border-left:4px solid #b7d46a">
            <strong>Requested items</strong><br><span style="line-height:1.8">${safe.items}</span>
          </div>
          <div style="margin-top:16px;padding:16px;background:#f8f9f8">
            <strong>Customer message</strong><p style="margin:8px 0 0;white-space:pre-wrap">${safe.message}</p>
          </div>`);
        const customerHtml = emailShell(`
          <div style="display:inline-block;background:#edf5d9;color:#526b20;padding:7px 10px;font-size:12px;font-weight:bold;letter-spacing:1px">REQUEST RECEIVED</div>
          <h1 style="margin:20px 0 10px;font-size:26px;color:#18201d">Thank you, ${safe.name}.</h1>
          <p style="font-size:16px;line-height:1.7;color:#46514c">We have received your container quote request. Our team will review the details and an administrator will get back to you shortly with availability, delivery information, and pricing.</p>
          <div style="margin:24px 0;padding:18px;background:#f4f5f3;border-left:4px solid #b7d46a">
            <strong>What happens next?</strong>
            <p style="margin:8px 0 0;color:#46514c;line-height:1.6">A member of our team will contact you using the details provided in your request.</p>
          </div>
          <p style="margin:0;color:#46514c;line-height:1.6">If you need to add information, simply reply to this email.</p>
          <p style="margin:24px 0 0;font-weight:bold">Best regards,<br>${escapeHtml(siteConfig.name)} Team</p>`);
        const adminResult = await Promise.allSettled([
          transporter.sendMail({
            from: fromAddress,
            to: notificationRecipients[0],
            replyTo: payload.email,
            subject: `[ADMIN] New container quote request from ${payload.name}`,
            text: adminMessage,
            html: adminHtml,
            headers: {
              'X-Quote-Notification': 'admin',
              'X-Priority': '1'
            }
          })
        ]);
        adminEmailDelivered = adminResult[0].status === 'fulfilled';
        if (!adminEmailDelivered) {
          emailStatusMessage = 'Quote saved, but the admin notification could not be delivered.';
          console.error(emailStatusMessage, adminResult[0].status === 'rejected' ? adminResult[0].reason : undefined);
        }
        const customerResult = await Promise.allSettled([
          transporter.sendMail({ from: fromAddress, to: payload.email, replyTo: notificationRecipients[0], subject: `We received your quote request - ${siteConfig.name}`, text: customerMessage, html: customerHtml })
        ]);
        customerEmailDelivered = customerResult[0].status === 'fulfilled';
        emailDelivered = customerEmailDelivered;
        if (!customerEmailDelivered) {
          emailStatusMessage = adminEmailDelivered
            ? 'Quote saved and admin notification sent, but the customer confirmation email could not be delivered.'
            : 'Quote saved, but the admin notification and customer confirmation could not be delivered.';
          console.error(emailStatusMessage, customerResult[0].status === 'rejected' ? customerResult[0].reason : undefined);
        } else if (!adminEmailDelivered) {
          emailStatusMessage = 'Quote saved and customer confirmation sent, but the admin notification could not be delivered.';
        }
      } catch (error) {
        emailStatusMessage = 'Quote saved, but email delivery failed.';
        console.error(emailStatusMessage, error);
      }
    }
    return NextResponse.json({ success: true, demo: !process.env.DATABASE_URL, emailDelivered, adminEmailDelivered, customerEmailDelivered, emailStatusMessage });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Please check the form fields and try again.' }, { status: 400 });
    console.error('Quote request failed', error);
    return NextResponse.json({ error: 'We could not submit your request right now. Please call our team.' }, { status: 500 });
  }
}