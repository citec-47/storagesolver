import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = { title: 'Contact STORAGE SOLVERS INC.', description: 'Contact STORAGE SOLVERS INC. for container availability, delivery, and pricing.' };
export default function ContactPage() {
  const contacts = [{ icon: Phone, title: 'Call', value: siteConfig.phone, href: `tel:${siteConfig.phoneLink}` }, ...(siteConfig.email ? [{ icon: Mail, title: 'Email', value: siteConfig.email, href: `mailto:${siteConfig.email}` }] : []), { icon: MapPin, title: 'Visit', value: siteConfig.address, href: '/delivery' }];
  return <main className="container-shell min-h-[70vh] py-14"><p className="eyebrow">We are here to help</p><h1 className="display-font mt-2 text-6xl font-bold uppercase">Talk containers.</h1><p className="mt-3 max-w-xl text-sm leading-7 text-muted">Tell us what you are working on. We can help compare sizes, confirm stock, and plan a delivery.</p><div className="mt-9 grid gap-4 sm:grid-cols-3">{contacts.map(({ icon: Icon, title, value, href }) => <a key={title} href={href} className="border border-black/10 bg-white p-6 hover:border-signal"><Icon className="text-signal" size={21} /><p className="mt-5 text-xs font-bold uppercase tracking-wide text-muted">{title}</p><p className="mt-2 text-sm font-bold">{value}</p></a>)}</div><Link href="/quote" className="button-primary mt-8">Request a quote</Link></main>;
}