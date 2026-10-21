import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { InquiryEditor } from '@/components/inquiry-editor';
import { getProducts, imageUrl } from '@/lib/products';

function parseInquiryItems(value: unknown): { slug: string; quantity: number; title?: string; imageUrl?: string; productUrl?: string }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === 'string') return [{ slug: item, quantity: 1 }];
    if (!item || typeof item !== 'object' || !('slug' in item) || typeof item.slug !== 'string') return [];
    const quantity = 'quantity' in item && typeof item.quantity === 'number' && Number.isInteger(item.quantity) && item.quantity > 0
      ? item.quantity
      : 1;
    const title = 'title' in item && typeof item.title === 'string' ? item.title : undefined;
    const imageUrl = 'imageUrl' in item && typeof item.imageUrl === 'string' ? item.imageUrl : undefined;
    const productUrl = 'productUrl' in item && typeof item.productUrl === 'string' ? item.productUrl : undefined;
    return [{ slug: item.slug, quantity, title, imageUrl, productUrl }];
  });
}

export default async function InquiryDetailPage({ params }: { params: { id: string } }) {
  if (!process.env.DATABASE_URL) notFound();
  let inquiry;
  try { inquiry = await prisma.inquiry.findUnique({ where: { id: params.id } }); } catch { notFound(); }
  if (!inquiry) notFound();
  const requestedItems = parseInquiryItems(inquiry.items);
  const products = await getProducts();
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  return <><p className="eyebrow">Sales pipeline / inquiry</p><h1 className="display-font mt-1 text-4xl font-bold uppercase">{inquiry.name}</h1><p className="mt-2 text-sm text-muted">Received {inquiry.createdAt.toLocaleString()}</p><div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]"><section className="border border-black/10 bg-white p-6"><h2 className="font-bold">Contact details</h2><dl className="mt-4 grid grid-cols-2 gap-4 text-sm">{[['Email', inquiry.email], ['Phone', inquiry.phone], ['Company', inquiry.company ?? '—'], ['Delivery address', `${inquiry.deliveryAddress ?? ''} ${inquiry.deliveryZip ?? ''}` || '—']].map(([label, value]) => <div key={label}><dt className="text-xs font-bold uppercase text-muted">{label}</dt><dd className="mt-1">{value}</dd></div>)}</dl><h2 className="mt-7 font-bold">Requested items</h2>{requestedItems.length ? <div className="mt-3 divide-y divide-black/10 border-y border-black/10">{requestedItems.map((item, index) => {
    const product = productBySlug.get(item.slug);
    const href = item.productUrl?.startsWith('/containers/') ? item.productUrl : product ? `/containers/${product.slug}` : undefined;
    const title = item.title ?? product?.title;
    const photo = item.imageUrl ?? (product ? imageUrl(product.images[0]?.publicId ?? '', 400) : undefined);
    return <article key={`${item.slug}-${index}`} className="flex gap-4 py-4">
      {photo && href ? <Link href={href} className="block h-24 w-32 shrink-0 overflow-hidden bg-[#d8dedb]"><img src={photo} alt={title ?? item.slug} className="h-full w-full object-cover" /></Link> : photo ? <img src={photo} alt={title ?? item.slug} className="h-24 w-32 shrink-0 object-cover" /> : <div className="grid h-24 w-32 shrink-0 place-items-center bg-canvas text-center text-xs text-muted">Image unavailable</div>}
      <div className="min-w-0"><p className="eyebrow">Quantity {item.quantity}</p>{title && href ? <Link href={href} className="mt-1 block font-bold hover:text-signal">{title}</Link> : <p className="mt-1 font-bold">{title ?? item.slug}</p>}<p className="mt-1 break-all text-xs text-muted">{item.slug}</p>{href && <Link href={href} className="mt-2 inline-block text-xs font-bold text-signal underline underline-offset-2">View container listing</Link>}</div>
    </article>;
  })}</div> : <p className="mt-3 bg-canvas p-4 text-sm text-muted">No individual container was selected for this request.</p>}<p className="mt-5 whitespace-pre-wrap text-sm leading-6">{inquiry.message ?? 'No message provided.'}</p></section><InquiryEditor id={inquiry.id} status={inquiry.status} notes={inquiry.internalNotes ?? ''} /></div></>;
}