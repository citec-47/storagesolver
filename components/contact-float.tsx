import { MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export function ContactFloat() {
  return <div className="fixed bottom-3 right-3 z-40 flex flex-row gap-2 sm:bottom-5 sm:right-5 sm:flex-col"><a href={`https://wa.me/${siteConfig.whatsapp}`} aria-label="Chat on WhatsApp" title="Chat on WhatsApp" className="grid h-10 w-10 place-items-center bg-[#2c8b57] text-white shadow-soft sm:h-12 sm:w-12"><MessageCircle size={18} /></a><a href={`tel:${siteConfig.phoneLink}`} aria-label="Call Harborline" title="Call Harborline" className="grid h-10 w-10 place-items-center bg-signal text-white shadow-soft sm:h-12 sm:w-12"><Phone size={17} /></a></div>;
}