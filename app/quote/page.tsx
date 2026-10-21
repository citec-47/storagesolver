import type { Metadata } from 'next';
import { Phone } from 'lucide-react';
import { QuoteForm } from '@/components/quote-form';
import { getProductBySlug } from '@/lib/products';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = { title: 'Request a Container Quote', description: 'Tell us what container you need and where it is going. Get a no-obligation quote.' };
export default async function QuotePage({ searchParams }: { searchParams: { product?: string; size?: string } }) {
  const product = searchParams.product ? await getProductBySlug(searchParams.product) : undefined;
  return <main className="min-h-screen pb-20"><section className="bg-ink py-12 text-white"><div className="container-shell"><p className="eyebrow">No obligation</p><h1 className="display-font mt-2 text-5xl font-bold uppercase">Let’s get you a quote</h1><p className="mt-3 max-w-lg text-sm leading-6 text-white/65">Share a few details and our container team will confirm availability, delivery, and pricing.</p></div></section><div className="container-shell grid gap-9 pt-9 lg:grid-cols-[1fr_300px]"><section className="border border-black/10 bg-white p-5 sm:p-8">{product && <p className="mb-6 border-l-2 border-signal bg-canvas px-4 py-3 text-sm font-semibold">Requesting: {product.title}</p>}<QuoteForm productSlug={product?.slug} initialSize={searchParams.size} /></section><aside className="h-fit bg-ink p-6 text-white"><p className="eyebrow">Prefer to talk?</p><h2 className="display-font mt-2 text-3xl font-bold uppercase">We can help plan it.</h2><p className="mt-3 text-sm leading-6 text-white/65">We can talk through size, condition, site access, and delivery timing with you.</p><a className="mt-6 flex items-center gap-2 text-lg font-bold" href={`tel:${siteConfig.phoneLink}`}><Phone className="text-signal" size={18} />{siteConfig.phone}</a><p className="mt-2 text-xs text-white/50">Monday–Friday, 8am–5pm ET</p></aside></div></main>;
}