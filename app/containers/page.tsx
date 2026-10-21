import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getProducts, formatPrice } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { sizeOptions, conditionLabels, typeLabels, sizeLabels } from '@/lib/config';
import { InventorySort } from '@/components/inventory-sort';

export const metadata: Metadata = { title: 'Shipping Container Inventory', description: 'Shop inspected shipping containers in 10ft, 20ft, 40ft, 45ft, and 53ft sizes.' };
type SearchParams = { size?: string; type?: string; condition?: string; location?: string; min?: string; max?: string; sort?: string; q?: string; page?: string };

export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const all = await getProducts();
  const q = searchParams.q?.trim().toLowerCase() ?? '';
  const filtered = all.filter((product) => (!searchParams.size || product.size === searchParams.size) && (!searchParams.type || product.type === searchParams.type) && (!searchParams.condition || product.condition === searchParams.condition) && (!searchParams.location || product.location.toLowerCase().includes(searchParams.location.toLowerCase())) && (!searchParams.min || product.price >= Number(searchParams.min)) && (!searchParams.max || product.price <= Number(searchParams.max)) && (!q || `${product.title} ${product.location} ${product.description}`.toLowerCase().includes(q)));
  if (searchParams.sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (searchParams.sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  if (searchParams.sort === 'newest') filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const pageSize = 9;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const products = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selectedSize = searchParams.size ? sizeLabels[searchParams.size] : null;
  return <main className="min-h-screen pb-20">
    <section className="bg-ink py-12 text-white"><div className="container-shell"><p className="eyebrow">STORAGE SOLVERS inventory</p><h1 className="display-font mt-2 text-5xl font-bold uppercase">{selectedSize ? `${selectedSize} containers` : 'Find your container'}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Browse current stock, compare condition and size, then request pricing with delivery to your location.</p></div></section>
    <div className="container-shell pt-8">
      <div className="mb-6 flex flex-wrap gap-2">{sizeOptions.map((option) => <Link key={option.value} href={option.value === searchParams.size ? '/containers' : `/containers?size=${option.value}`} className={`border px-4 py-2 text-xs font-bold ${option.value === searchParams.size ? 'border-signal bg-signal text-white' : 'border-black/15 bg-white hover:border-signal'}`}>{option.label}</Link>)}</div>
      <div className="grid min-w-0 grid-cols-1 items-start gap-7 lg:grid-cols-[230px_minmax(0,1fr)]">
        <form action="/containers" className="w-full min-w-0 border border-black/10 bg-white p-5"><div className="flex min-w-0 items-center gap-2 border-b border-black/10 pb-4"><SlidersHorizontal size={16} className="shrink-0 text-signal" /><h2 className="font-bold">Filter inventory</h2></div>
          <label className="mt-4 block text-xs font-bold">Search<input name="q" defaultValue={searchParams.q} placeholder="Size, type, location" className="mt-2 h-10 w-full border border-black/15 px-3 text-sm outline-none focus:border-signal" /></label>
          <label className="mt-4 block text-xs font-bold">Size<select name="size" defaultValue={searchParams.size ?? ''} className="mt-2 h-10 w-full border border-black/15 bg-white px-3 text-sm"><option value="">All sizes</option>{sizeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label className="mt-4 block text-xs font-bold">Type<select name="type" defaultValue={searchParams.type ?? ''} className="mt-2 h-10 w-full border border-black/15 bg-white px-3 text-sm"><option value="">All types</option>{Object.entries(typeLabels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label>
          <label className="mt-4 block text-xs font-bold">Condition<select name="condition" defaultValue={searchParams.condition ?? ''} className="mt-2 h-10 w-full border border-black/15 bg-white px-3 text-sm"><option value="">All conditions</option>{Object.entries(conditionLabels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label>
          <label className="mt-4 block text-xs font-bold">Depot / location<input name="location" defaultValue={searchParams.location} placeholder="e.g. Newark" className="mt-2 h-10 w-full border border-black/15 px-3 text-sm outline-none focus:border-signal" /></label>
          <div className="mt-4 grid grid-cols-2 gap-2"><label className="text-xs font-bold">Min $<input type="number" min="0" name="min" defaultValue={searchParams.min} className="mt-2 h-10 w-full border border-black/15 px-2 text-sm" /></label><label className="text-xs font-bold">Max $<input type="number" min="0" name="max" defaultValue={searchParams.max} className="mt-2 h-10 w-full border border-black/15 px-2 text-sm" /></label></div>
          <button className="button-primary mt-5 w-full" type="submit">Apply filters <Search size={15} /></button><Link className="mt-3 block text-center text-xs font-semibold text-muted hover:text-signal" href="/containers">Clear filters</Link>
        </form>
        <section className="min-w-0"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted"><strong className="text-ink">{filtered.length}</strong> containers found</p><form action="/containers" className="flex items-center gap-2">{Object.entries(searchParams).filter(([, value]) => value).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}<InventorySort value={searchParams.sort ?? 'newest'} /></form></div>
          {products.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="border border-black/10 bg-white px-6 py-16 text-center"><h2 className="display-font text-3xl font-bold uppercase">No matching containers</h2><p className="mt-2 text-sm text-muted">Try adjusting your filters or clearing the search.</p><Link className="button-primary mt-5" href="/containers">See all inventory</Link></div>}
          {filtered.length > pageSize && <nav className="mt-8 flex justify-center gap-2" aria-label="Pagination">{Array.from({ length: totalPages }, (_, index) => <Link key={index} href={`/containers?${new URLSearchParams({ ...searchParams, page: String(index + 1) })}`} className={`grid h-10 w-10 place-items-center border text-sm font-bold ${page === index + 1 ? 'border-ink bg-ink text-white' : 'border-black/15 bg-white'}`}>{index + 1}</Link>)}</nav>}
        </section>
      </div>
    </div>
  </main>;
}