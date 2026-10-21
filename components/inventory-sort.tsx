'use client';

export function InventorySort({ value }: { value: string }) {
  return <label className="text-xs font-bold">Sort <select name="sort" defaultValue={value} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="ml-2 h-9 border border-black/15 bg-white px-2 text-xs"><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>;
}