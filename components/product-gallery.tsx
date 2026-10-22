'use client';

import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

type GalleryImage = { src: string; alt: string };
export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const entries = images.length ? images : [{ src: '', alt: title }];
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  return <div>
    <button type="button" aria-label="Zoom product image" onClick={() => setZoomed(true)} className="group relative block aspect-[1.25] w-full overflow-hidden bg-[#d9dfdc] text-left"><img className="h-full w-full object-cover" src={entries[active].src} alt={entries[active].alt || title} /><span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center bg-white text-ink opacity-0 transition group-hover:opacity-100"><ZoomIn size={18} /></span></button>
    <div className="mt-3 grid grid-cols-4 gap-3">{entries.map((image, index) => <button key={`${image.src}-${index}`} onClick={() => setActive(index)} aria-label={`View ${title} image ${index + 1}`} className={`aspect-[1.55] overflow-hidden border-2 bg-[#d9dfdc] ${index === active ? 'border-signal' : 'border-transparent'}`}><img className="h-full w-full object-cover" loading="lazy" src={image.src} alt={image.alt || `${title} view ${index + 1}`} /></button>)}</div>
    {zoomed && <div role="dialog" aria-modal="true" aria-label={`${title} image viewer`} className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-4" onClick={() => setZoomed(false)}><button aria-label="Close image viewer" className="absolute right-5 top-5 grid h-11 w-11 place-items-center bg-white text-ink"><X size={20} /></button><img src={entries[active].src} alt={entries[active].alt || title} className="max-h-[88vh] max-w-full object-contain" onClick={(event) => event.stopPropagation()} /></div>}
  </div>;
}