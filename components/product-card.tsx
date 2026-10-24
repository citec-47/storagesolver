import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { CatalogProduct } from '@/lib/demo-data';
import { conditionLabels, sizeLabels, typeLabels } from '@/lib/config';
import { formatPrice, imageUrl } from '@/lib/products';

export function ProductCard({ product }: { product: CatalogProduct }) {
  const photo = product.images[0];
  return <article className="group overflow-hidden border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-soft">
    <div className="relative aspect-[1.48] overflow-hidden bg-[#d8dedb]">
      <Link href={`/containers/${product.slug}`} className="absolute inset-0 block">
        <img src={imageUrl(photo?.publicId ?? '', 900)} alt={photo?.alt ?? product.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" />
        <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">{conditionLabels[product.condition]}</span>
        <span className="absolute right-3 top-3 bg-ink px-2.5 py-1 text-[10px] font-bold text-white">{product.stockQuantity > 0 ? 'In stock' : 'Sold out'}</span>
      </Link>
    </div>
    <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">{sizeLabels[product.size]} · {typeLabels[product.type]}</p><Link href={`/containers/${product.slug}`} className="mt-1 block font-bold leading-5 hover:text-signal">{product.title}</Link></div><Link href={`/containers/${product.slug}`} aria-label={`View ${product.title}`} className="grid h-9 w-9 shrink-0 place-items-center border border-black/10 text-signal transition hover:bg-signal hover:text-white"><ArrowUpRight size={17} /></Link></div>
      <p className="mt-3 flex items-center gap-1 text-xs text-muted"><MapPin size={13} />{product.location}</p><div className="mt-4 flex items-end justify-between border-t border-black/10 pt-4"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Price</span><strong className="display-font text-2xl font-bold">{formatPrice(product.price)}</strong></div>
    </div>
  </article>;
}