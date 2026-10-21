import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { CatalogProduct } from '@/lib/demo-data';
import { conditionLabels, sizeLabels, typeLabels } from '@/lib/config';
import { formatPrice, imageCredit, imageUrl } from '@/lib/products';

export function ProductCard({ product, featuredPhoto }: { product: CatalogProduct; featuredPhoto?: { src: string; credit: string; creditUrl: string } }) {
  const photo = product.images[0];
  const credit = featuredPhoto ? { credit: featuredPhoto.credit, creditUrl: featuredPhoto.creditUrl } : imageCredit(photo?.publicId ?? '');
  return <article className="group overflow-hidden border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-soft">
    <div className="relative aspect-[1.48] overflow-hidden bg-[#d8dedb]">
      <Link href={`/containers/${product.slug}`} className="absolute inset-0 block">
        <img src={featuredPhoto?.src ?? imageUrl(photo?.publicId ?? '', 900)} alt={photo?.alt ?? product.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" />
        {!featuredPhoto && <>
          <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">{conditionLabels[product.condition]}</span>
          <span className="absolute right-3 top-3 bg-ink px-2.5 py-1 text-[10px] font-bold text-white">{product.stockQuantity > 0 ? 'In stock' : 'Sold out'}</span>
          <span className="absolute bottom-3 left-3 bg-ink/85 px-2.5 py-1 text-[10px] font-semibold text-white">Representative photo</span>
        </>}
      </Link>
      {credit && !featuredPhoto && <a href={credit.creditUrl} target="_blank" rel="noreferrer" className="absolute bottom-3 right-3 bg-ink/85 px-2.5 py-1 text-[9px] font-semibold text-white underline">{credit.credit}</a>}
    </div>
    {featuredPhoto && <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-black/10 px-5 py-2 pr-24 text-[10px] text-muted sm:pr-5"><span>Representative image</span><a href={featuredPhoto.creditUrl} target="_blank" rel="noreferrer" className="break-words underline underline-offset-2">Photo: {featuredPhoto.credit}</a></div>}
    <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">{sizeLabels[product.size]} · {typeLabels[product.type]}</p><Link href={`/containers/${product.slug}`} className="mt-1 block font-bold leading-5 hover:text-signal">{product.title}</Link></div><Link href={`/containers/${product.slug}`} aria-label={`View ${product.title}`} className="grid h-9 w-9 shrink-0 place-items-center border border-black/10 text-signal transition hover:bg-signal hover:text-white"><ArrowUpRight size={17} /></Link></div>
      <p className="mt-3 flex items-center gap-1 text-xs text-muted"><MapPin size={13} />{product.location}</p><div className="mt-4 flex items-end justify-between border-t border-black/10 pt-4"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Starting at</span><strong className="display-font text-2xl font-bold">{formatPrice(product.salePrice ?? product.price)}</strong></div>
    </div>
  </article>;
}