import { Phone } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export function ContactFloat() {
  return <a href={`tel:${siteConfig.phoneLink}`} aria-label="Call Harborline" title="Call Harborline" className="fixed bottom-3 right-3 z-40 grid h-10 w-10 place-items-center bg-signal text-white shadow-soft sm:bottom-5 sm:right-5 sm:h-12 sm:w-12"><Phone size={17} /></a>;
}