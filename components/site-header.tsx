'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, Menu, Phone, X } from 'lucide-react';
import { siteConfig, sizeOptions } from '@/lib/config';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f4f5f2]/95 backdrop-blur">
    <div className="container-shell flex h-[72px] items-center justify-between gap-5">
      <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="STORAGE SOLVERS INC. home">
        <span className="grid h-9 w-9 place-items-center bg-signal text-white"><span className="display-font text-xl font-bold">H</span></span>
        <span className="leading-tight"><strong className="display-font block text-[17px] font-bold uppercase">STORAGE SOLVERS</strong><small className="block text-[9px] font-bold uppercase tracking-[.16em] text-muted">INC.</small></span>
      </Link>
      <nav className="hidden items-center gap-7 lg:flex">
        <Link className="text-xs font-bold hover:text-signal" href="/">Home</Link>
        <div className="group relative"><Link className="inline-flex items-center gap-1 text-xs font-bold hover:text-signal" href="/containers">Containers <ChevronDown size={13} /></Link><div className="invisible absolute left-0 top-full w-48 border border-black/10 bg-white p-2 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100">{sizeOptions.map((size) => <Link key={size.value} className="block px-3 py-2 text-xs font-semibold hover:bg-canvas hover:text-signal" href={`/containers/${size.slug}`}>{size.label} containers</Link>)}</div></div>
        <Link className="text-xs font-bold hover:text-signal" href="/delivery">Delivery</Link><Link className="text-xs font-bold hover:text-signal" href="/about">About</Link><Link className="text-xs font-bold hover:text-signal" href="/contact">Contact</Link>
      </nav>
      <div className="hidden items-center gap-5 sm:flex"><a className="inline-flex items-center gap-2 text-xs font-bold" href={`tel:${siteConfig.phoneLink}`}><Phone size={14} className="text-signal" />{siteConfig.phone}</a><Link href="/quote" className="button-primary min-h-10 px-4 text-xs">Get a quote</Link></div>
      <button type="button" className="grid h-10 w-10 place-items-center border border-black/10 lg:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}>{open ? <X size={19} /> : <Menu size={19} />}</button>
    </div>
    {open && <nav className="border-t border-black/10 bg-white px-5 pb-5 pt-2 lg:hidden">{[['Home', '/'], ['All containers', '/containers'], ['Delivery', '/delivery'], ['About', '/about'], ['FAQ', '/faq'], ['Contact', '/contact'], ['Get a quote', '/quote']].map(([label, href]) => <Link key={href} onClick={() => setOpen(false)} className="block border-b border-black/5 py-3 text-sm font-semibold" href={href}>{label}</Link>)}</nav>}
  </header>;
}