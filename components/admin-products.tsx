'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, ImagePlus, LoaderCircle, Plus, Save, Trash2 } from 'lucide-react';
import { priceForContainerSize, type ContainerSize } from '@/lib/container-pricing';

type ProductImage = { publicId: string; url: string };
type ProductRow = { id: string; slug: string; title: string; size: ContainerSize; type: string; condition: string; stockQuantity: number; price: number; status: string; location: string; description: string; images: ProductImage[] };
const productCategories: { size: ContainerSize | 'ALL'; label: string }[] = [
  { size: 'ALL', label: 'All sizes' },
  { size: 'FT10', label: '10 ft' },
  { size: 'FT20', label: '20 ft' },
  { size: 'FT40', label: '40 ft' },
  { size: 'FT45', label: '45 ft' },
  { size: 'FT53', label: '53 ft' }
];
const inputClass = 'h-10 w-full border border-black/15 bg-white px-3 text-sm outline-none focus:border-signal';

export function AdminProducts({ products: initialProducts, loadError }: { products: ProductRow[]; loadError?: string }) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<ContainerSize | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [selectedSize, setSelectedSize] = useState<ContainerSize>('FT20');
  const [price, setPrice] = useState(priceForContainerSize('FT20'));
  const hiddenProducts = products.filter((product) => product.status !== 'ACTIVE');
  const visibleProducts = products.filter((product) => selectedCategory === 'ALL' || product.size === selectedCategory);
  async function uploadFiles(files: FileList | null, slug: string) {
    if (!files?.length) return;
    setUploading(true); setMessage('');
    try {
      const signed = await fetch('/api/admin/cloudinary-signature', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      const signature = await signed.json() as { timestamp: number; folder: string; signature: string; apiKey: string; cloudName: string; error?: string };
      if (!signed.ok) throw new Error(signature.error ?? 'Cloudinary upload is unavailable.');
      const uploaded: ProductImage[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.set('file', file); body.set('api_key', signature.apiKey); body.set('timestamp', String(signature.timestamp)); body.set('folder', signature.folder); body.set('signature', signature.signature);
        const result = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, { method: 'POST', body });
        const asset = await result.json() as { public_id?: string; secure_url?: string; error?: { message?: string } };
        if (!result.ok || !asset.public_id || !asset.secure_url) throw new Error(asset.error?.message ?? 'An image could not be uploaded.');
        uploaded.push({ publicId: asset.public_id, url: asset.secure_url });
      }
      setImages((existing) => [...existing, ...uploaded]);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed.'); }
    finally { setUploading(false); }
  }
  async function removeImage(publicId: string) {
    if (publicId.startsWith('containers/')) {
      try {
        const response = await fetch('/api/admin/cloudinary-delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId }) });
        if (!response.ok) { const result = await response.json() as { error?: string }; setMessage(result.error ?? 'Could not delete image from Cloudinary.'); return false; }
      } catch {
        setMessage('Could not reach Cloudinary to delete this image.');
        return false;
      }
    }
    setImages((current) => current.filter((image) => image.publicId !== publicId));
    return true;
  }
  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setBusy(true); setMessage('');
    const data = new FormData(event.currentTarget);
    const payload = { slug: data.get('slug'), title: data.get('title'), size: data.get('size'), type: data.get('type'), condition: data.get('condition'), price: Number(data.get('price')), stockQuantity: Number(data.get('stockQuantity')), location: data.get('location'), description: data.get('description'), status: data.get('status'), images: images.map((image) => image.publicId) };
    const response = await fetch(`/api/admin/products/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json() as { error?: unknown };
    setBusy(false);
    if (!response.ok) { setMessage(typeof result.error === 'string' ? result.error : 'Could not save product changes.'); return; }
    window.location.reload();
  }
  function moveImage(index: number, offset: number) {
    const destination = index + offset;
    if (destination < 0 || destination >= images.length) return;
    setImages((current) => { const next = [...current]; [next[index], next[destination]] = [next[destination], next[index]]; return next; });
  }
  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const data = new FormData(event.currentTarget);
    const payload = { slug: data.get('slug'), title: data.get('title'), size: data.get('size'), type: data.get('type'), condition: data.get('condition'), price: Number(data.get('price')), stockQuantity: Number(data.get('stockQuantity')), location: data.get('location'), description: data.get('description'), status: data.get('status'), images: images.map((image) => image.publicId) };
    const response = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json() as { error?: unknown };
    setBusy(false);
    if (!response.ok) { setMessage(typeof result.error === 'string' ? result.error : 'Could not create product. Check required fields and database setup.'); return; }
    window.location.reload();
  }
  async function updateProduct(product: ProductRow, patch: Partial<ProductRow>) {
    const response = await fetch(`/api/admin/products/${product.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
    if (!response.ok) { setMessage('Could not save product. Check the database connection and admin session.'); return; }
    setProducts((items) => items.map((item) => item.id === product.id ? { ...item, ...patch } : item));
  }
  async function duplicate(product: ProductRow) {
    const response = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...product, id: undefined, slug: `${product.slug}-copy`, title: `${product.title} (copy)`, description: `Copy of ${product.title}`, status: 'DRAFT', images: [] }) });
    if (response.ok) window.location.reload(); else setMessage('Could not duplicate this product.');
  }
  async function remove(product: ProductRow): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      if (!response.ok) { setMessage('Could not delete this product. Check the database connection and admin session.'); return false; }
      setProducts((items) => items.filter((item) => item.id !== product.id));
      return true;
    } catch {
      setMessage('Could not reach the server to delete this product.');
      return false;
    }
  }
  function startEdit(product: ProductRow) { setEditing(product); setSelectedSize(product.size); setPrice(product.price); setImages(product.images); setShowForm(false); setMessage(''); }
  async function deleteProduct(product: ProductRow, confirm = true): Promise<boolean> {
    if (confirm && !window.confirm(`Delete ${product.title}? This cannot be undone.`)) return false;
    if (!await remove(product)) return false;
    for (const { publicId } of product.images) {
      if (!publicId.startsWith('containers/')) continue;
      try {
        const imageResponse = await fetch('/api/admin/cloudinary-delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId }) });
        if (!imageResponse.ok) { setMessage('The product was deleted, but a Cloudinary image could not be removed.'); return false; }
      } catch {
        setMessage('The product was deleted, but the server could not reach Cloudinary to remove an image.');
        return false;
      }
    }
    return true;
  }
  async function deleteHiddenProducts() {
    if (!hiddenProducts.length || !window.confirm(`Permanently delete ${hiddenProducts.length} products that are not visible on the storefront (Draft or Sold Out)? This cannot be undone.`)) return;
    setBusy(true);
    setMessage('');
    let deleted = 0;
    for (const product of hiddenProducts) {
      if (!await deleteProduct(product, false)) {
        setMessage((current) => `${current || 'Stopped during cleanup.'} ${deleted} hidden product(s) deleted before the failure.`);
        setBusy(false);
        return;
      }
      deleted += 1;
    }
    setMessage(`Deleted ${deleted} hidden product(s).`);
    setBusy(false);
  }
  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white p-4"><div><strong className="text-sm">{products.length} catalog items</strong><p className="mt-1 text-xs text-muted">{hiddenProducts.length} hidden from the storefront (Draft or Sold Out)</p>{loadError && <p role="alert" className="mt-1 text-xs text-red-700">{loadError}</p>}{message && <p role="alert" className="mt-1 text-xs text-red-700">{message}</p>}</div><div className="flex flex-wrap gap-2"><button type="button" disabled={Boolean(loadError) || busy || hiddenProducts.length === 0} onClick={() => void deleteHiddenProducts()} className="min-h-9 border border-red-700 px-3 text-xs font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Deleting...' : `Delete hidden (${hiddenProducts.length})`}</button><button type="button" disabled={Boolean(loadError) || busy} onClick={() => { setShowForm(!showForm); setEditing(null); setSelectedSize('FT20'); setPrice(priceForContainerSize('FT20')); setImages([]); }} className="button-primary min-h-9 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"><Plus size={14} />{showForm ? 'Close form' : 'New product'}</button></div></div>
    <nav aria-label="Filter products by size" className="mt-3 flex flex-wrap gap-2">{productCategories.map((category) => {
      const count = category.size === 'ALL' ? products.length : products.filter((product) => product.size === category.size).length;
      return <button key={category.size} type="button" aria-pressed={selectedCategory === category.size} onClick={() => setSelectedCategory(category.size)} className={`border px-3 py-2 text-xs font-bold ${selectedCategory === category.size ? 'border-ink bg-ink text-white' : 'border-black/15 bg-white text-ink hover:border-ink'}`}>{category.label} <span className="opacity-70">({count})</span></button>;
    })}</nav>
    {(showForm || editing) && <form onSubmit={editing ? saveEdit : createProduct} className="mt-3 border border-black/10 bg-white p-5"><div className="flex items-start justify-between"><h2 className="display-font text-2xl font-bold uppercase">{editing ? `Edit ${editing.title}` : 'New catalog item'}</h2>{editing && <button type="button" onClick={() => { setEditing(null); setImages([]); }} className="text-xs font-bold text-muted">Cancel</button>}</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><label className="text-xs font-bold">Title<input required name="title" defaultValue={editing?.title} className={`${inputClass} mt-1`} /></label><label className="text-xs font-bold">Slug<input required pattern="[a-z0-9-]+" name="slug" defaultValue={editing?.slug} placeholder="20ft-one-trip-standard" className={`${inputClass} mt-1`} /></label><label className="text-xs font-bold">Size<select name="size" value={selectedSize} onChange={(event) => { const size = event.target.value as ContainerSize; setSelectedSize(size); setPrice(priceForContainerSize(size)); }} className={`${inputClass} mt-1`}>{[['FT10', '10 ft'], ['FT20', '20 ft'], ['FT40', '40 ft'], ['FT45', '45 ft'], ['FT53', '53 ft']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-bold">Type<select name="type" defaultValue={editing?.type ?? 'STANDARD'} className={`${inputClass} mt-1`}>{[['STANDARD', 'Standard'], ['HIGH_CUBE', 'High Cube'], ['OPEN_TOP', 'Open Top'], ['FLAT_RACK', 'Flat Rack'], ['REEFER', 'Reefer'], ['SIDE_DOOR', 'Side Door'], ['OFFICE_MODIFIED', 'Office / Modified']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-bold">Condition<select name="condition" defaultValue={editing?.condition ?? 'ONE_TRIP'} className={`${inputClass} mt-1`}>{[['NEW', 'New'], ['ONE_TRIP', 'One-Trip'], ['CARGO_WORTHY', 'Cargo Worthy'], ['WIND_WATER_TIGHT', 'Used - Wind & Water Tight'], ['AS_IS', 'As-Is']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-bold">Status<select name="status" defaultValue={editing?.status ?? 'DRAFT'} className={`${inputClass} mt-1`}>{['DRAFT', 'ACTIVE', 'SOLD_OUT'].map((value) => <option key={value}>{value}</option>)}</select></label><label className="text-xs font-bold">Price<input required type="number" min="0" name="price" value={price} onChange={(event) => setPrice(Number(event.target.value))} className={`${inputClass} mt-1`} /></label><label className="text-xs font-bold">Stock quantity<input required type="number" min="0" name="stockQuantity" defaultValue={editing?.stockQuantity} className={`${inputClass} mt-1`} /></label><label className="text-xs font-bold">Location<input required name="location" defaultValue={editing?.location} className={`${inputClass} mt-1`} /></label><label className="text-xs font-bold sm:col-span-2 lg:col-span-3">Description<textarea required name="description" defaultValue={editing?.description} rows={3} className="mt-1 w-full border border-black/15 p-3 text-sm" /></label></div><div className="mt-4 flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 border border-black/15 px-3 py-2 text-xs font-bold"><ImagePlus size={15} />{uploading ? 'Uploading...' : 'Upload images'}<input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => void uploadFiles(event.target.files, (document.querySelector<HTMLInputElement>('input[name="slug"]')?.value || 'new-container'))} /></label><span className="text-xs text-muted">{images.length} Cloudinary images selected; first image is the main image.</span>{uploading && <LoaderCircle className="animate-spin" size={15} />}</div><button disabled={busy || uploading} className="button-primary mt-5"><Save size={15} />{busy ? 'Saving...' : editing ? 'Save changes' : 'Create product'}</button></form>}
    {images.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{images.map((image, index) => <div key={image.publicId} className="overflow-hidden border border-black/10 bg-white text-xs"><img src={image.url} alt={`${editing?.title ?? 'New container'} photo ${index + 1}`} className="aspect-[1.5] w-full object-cover" /><div className="flex items-center gap-2 p-2"><span className="mr-auto font-bold">{index === 0 ? 'Main image' : `Image ${index + 1}`}</span><button type="button" aria-label="Move image up" onClick={() => moveImage(index, -1)}><ArrowUp size={14} /></button><button type="button" aria-label="Move image down" onClick={() => moveImage(index, 1)}><ArrowDown size={14} /></button><button type="button" aria-label="Delete image from product" onClick={() => void removeImage(image.publicId)}><Trash2 size={14} /></button></div></div>)}</div>}
    <div className="mt-3 overflow-x-auto border border-black/10 bg-white"><table className="w-full min-w-[950px] text-left text-xs"><thead className="bg-[#e8ece8] uppercase text-muted"><tr>{['Product', 'Size / type', 'Condition', 'Depot', 'Price', 'Stock', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-black/5">{visibleProducts.map((product) => <tr key={product.id}><td className="px-3 py-3 font-bold"><div className="flex min-w-48 items-center gap-3">{product.images[0] ? <img src={product.images[0].url} alt={`${product.title} container`} className="h-16 w-24 shrink-0 border border-black/10 bg-canvas object-cover" /> : <span className="grid h-16 w-24 shrink-0 place-items-center border border-black/10 bg-canvas text-[10px] font-normal text-muted">No image</span>}<span>{product.title}<small className="mt-1 block font-normal text-muted">/{product.slug}</small></span></div></td><td className="px-3 py-3">{product.size.replace('FT', '')} ft · {product.type.replaceAll('_', ' ')}</td><td className="px-3 py-3">{product.condition.replaceAll('_', ' ')}</td><td className="px-3 py-3">{product.location}</td><td className="px-3 py-3">{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</td><td className="px-3 py-3"><input aria-label={`Stock for ${product.title}`} type="number" defaultValue={product.stockQuantity} className="h-8 w-16 border border-black/15 px-2" onBlur={(event) => { const stockQuantity = Number(event.target.value); if (stockQuantity !== product.stockQuantity) void updateProduct(product, { stockQuantity }); }} /></td><td className="px-3 py-3"><button onClick={() => void updateProduct(product, { status: product.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' })} className="font-bold hover:text-signal">{product.status}</button></td><td className="px-3 py-3"><div className="flex gap-2"><button aria-label={`Edit ${product.title}`} onClick={() => startEdit(product)} className="font-bold text-muted hover:text-signal">Edit</button><button aria-label={`Duplicate ${product.title}`} onClick={() => void duplicate(product)} className="text-muted hover:text-signal"><Copy size={15} /></button><button aria-label={`Delete ${product.title}`} onClick={() => void deleteProduct(product)} className="text-muted hover:text-red-700"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table>{visibleProducts.length === 0 && <p className="p-6 text-sm text-muted">No products in this size category.</p>}</div>
  </div>;
}