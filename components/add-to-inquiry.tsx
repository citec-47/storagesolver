'use client';

import { ArrowRight } from 'lucide-react';

export function AddToInquiry({ slug }: { slug: string }) {
  function add() {
    try {
      const stored = JSON.parse(localStorage.getItem('container-inquiry-cart') ?? '[]') as (string | { slug: string; quantity: number })[];
      const cart = stored.map((item) => typeof item === 'string' ? { slug: item, quantity: 1 } : item);
      if (!cart.some((item) => item.slug === slug)) localStorage.setItem('container-inquiry-cart', JSON.stringify([...cart, { slug, quantity: 1 }]));
    } catch { /* continue to the quote flow if browser storage is unavailable */ }
    window.location.href = '/cart';
  }
  return <button className="border border-black/20 px-5 text-sm font-bold hover:border-signal hover:text-signal" type="button" onClick={add}>Add to inquiry <ArrowRight className="ml-1 inline" size={14} /></button>;
}