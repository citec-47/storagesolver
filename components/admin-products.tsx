'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, ImagePlus, LoaderCircle, Plus, Save, Trash2 } from 'lucide-react';
import { priceForContainerSize, type ContainerSize } from '@/lib/container-pricing';

type ProductRow = { id: string; slug: string; title: string; size: ContainerSize; type: string; condition: string; stockQuantity: number; price: number; status: string; location: string; description: string; images: string[] };
const inputClass = 'h-10 w-full border border-black/15 bg-white px-3 text-sm outline-none focus:border-signal';

export function AdminProducts({ products: initialProducts }: { products: ProductRow[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [selectedSize, setSelectedSize] = useState<ContainerSize>('FT20');
  async function uploadFiles(files: FileList | null, slug: string) {
    if (!files?.length) return;
    setUploading(true); setMessage('');
    try {
      const signed = await fetch('/api/admin/cloudinary-signature', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      const signature = await signed.json() as { timestamp: number; folder: string; signature: string; apiKey: string; cloudName: string; error?: string };
      if (!signed.ok) throw new Error(signature.error ?? 'Cloudinary upload is unavailable.');
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.set('file', file); body.set('api_key', signature.apiKey); body.set('timestamp', String(signature.timestamp)); body.set('folder', signature.folder); body.set('signature', signature.signature);
        const result = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, { method: 'POST', body });
        const asset = await result.json() as { public_id?: string; error?: { message?: string } };
        if (!result.ok || !asset.public_id) throw new Error(asset.error?.message ?? 'An image could not be uploaded.');
        uploaded.push(asset.public_id);
      }
      setImages((existing) => [...existing, ...uploaded]);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed.'); }
    finally { setUploading(false); }
  }
  async function removeImage(publicId: string) {
    const response = await fetch('/api/admin/cloudinary-delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId }) });
    if (!response.ok) { const result = await response.json() as { error?: string }; setMessage(result.error ?? 'Could not delete image from Cloudinary.'); return false; }
    setImages((current) => current.filter((image) => image !== publicId));
    return true;
  }
  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setBusy(true); setMessage('');
    const data = new FormData(event.currentTarget);
    const payload = { slug: data.get('slug'), title: data.get('title'), size: data.get('size'), type: data.get('type'), condition: data.get('condition'), price: Number(data.get('price')), stockQuantity: Number(data.get('stockQuantity')), location: data.get('location'), description: data.get('description'), status: data.get('status'), images };
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
    const payload = { slug: data.get('slug'), title: data.get('title'), size: data.get('size'), type: data.get('type'), condition: data.get('condition'), price: Number(data.get('price')), stockQuantity: Number(data.get('stockQuantity')), location: data.get('location'), description: data.get('description'), status: data.get('status'), images };
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
  async function remove(product: ProductRow) {
    if (!window.confirm(`Delete ${product.title}? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
    if (response.ok) setProducts((items) => items.filter((item) => item.id !== product.id)); else setMessage('Could not delete this product.');
  }
  function startEdit(product: ProductRow) { setEditing(product); setSelectedSize(product.size); setImages(product.images); setShowForm(false); setMessage(''); }
  async function deleteProduct(product: ProductRow) {
    if (!window.confirm(`Delete ${product.title}? Its Cloudinary images will also be removed.`)) return;
    for (const publicId of product.images) {
      const imageResponse = await fetch('/api/admin/cloudinary-delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId }) });
      if (!imageResponse.ok) { setMessage('A Cloudinary image could not be deleted, so the product was kept.'); return; }
    }
    await remove(product);
  }
  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white p-4"><div><strong className="text-sm">{products.length} catalog items</strong>{message && <p role="alert" className="mt-1 text-xs text-red-700">{message}</p>}</div><button onClick={() => { setShowForm(!showForm); setEditing(null); setSelectedSize('FT20'); setImages([]); }} className="button-primary min-h-9 px-3 text-xs"><Plus size={14} />{showForm ? 'Close form' : 'New product'}</button></div>
    {(showForm || editing) && <form onSubmit={editing ? saveEdit : createProduct} className="mt-3 border border-black/10 bg-white p-5"><div className="flex items-start justify-between"><h2 className="display-font text-2xl font-bold uppercase">{editing ? `Edit ${editing.title}` : 'New catalog item'}</h2>{editing && <button type="button" onClick={() => { setEditing(null); setImages([]); }} className="text-xs font-bold text-muted">Cancel</button>}</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><label className="text-xs font-bold">Title<input required name="title" defaultValue={editing?.title} className={`${inputClass} mt-1`} /></label><label className="text-xs font-bold">Slug<input required pattern="[a-z0-9-]+" name="slug" defaultValue={editing?.slug} placeholder="20ft-one-trip-standard" className={`${inputClass} mt-1`} /></label><label className="text-xs font-bold">Size<select name="size" value={selectedSize} onChange={(event) => setSelectedSize(event.target.value as ContainerSize)} className={`${inputClass} mt-1`}>{[['FT10', '10 ft'], ['FT20', '20 ft'], ['FT40', '40 ft'], ['FT45', '45 ft'], ['FT53', '53 ft']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-bold">Type<select name="type" defaultValue={editing?.type ?? 'STANDARD'} className={`${inputClass} mt-1`}>{[['STANDARD', 'Standard'], ['HIGH_CUBE', 'High Cube'], ['OPEN_TOP', 'Open Top'], ['FLAT_RACK', 'Flat Rack'], ['REEFER', 'Reefer'], ['SIDE_DOOR', 'Side Door'], ['OFFICE_MODIFIED', 'Office / Modified']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-bold">Condition<select name="condition" defaultValue={editing?.condition ?? 'ONE_TRIP'} className={`${inputClass} mt-1`}>{[['NEW', 'New'], ['ONE_TRIP', 'One-Trip'], ['CARGO_WORTHY', 'Used - Cargo Worthy'], ['WIND_WATER_TIGHT', 'Used - Wind & Water Tight'], ['AS_IS', 'As-Is']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-bold">Status<select name="status" defaultValue={editing?.status ?? 'DRAFT'} className={`${inputClass} mt-1`}>{['DRAFT', 'ACTIVE', 'SOLD_OUT'].map((value) => <option key={value}>{value}</option>)}</select></label><label className="text-xs font-bold">Fixed category price<input required type="number" name="price" value={priceForContainerSize(selectedSize)} readOnly className={`${inputClass} mt-1`} /></label><label className="text-xs font-bold">Stock quantity<input required type="number" min="0" name="stockQuantity" defaultValue={editing?.stockQuantity} className={`${inputClass} mt-1`} /></label><label className="text-xs font-bold">Location<input required name="location" defaultValue={editing?.location} className={`${inputClass} mt-1`} /></label><label className="text-xs font-bold sm:col-span-2 lg:col-span-3">Description<textarea required name="description" defaultValue={editing?.description} rows={3} className="mt-1 w-full border border-black/15 p-3 text-sm" /></label></div><div className="mt-4 flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 border border-black/15 px-3 py-2 text-xs font-bold"><ImagePlus size={15} />{uploading ? 'Uploading...' : 'Upload images'}<input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => void uploadFiles(event.target.files, (document.querySelector<HTMLInputElement>('input[name="slug"]')?.value || 'new-container'))} /></label><span className="text-xs text-muted">{images.length} Cloudinary images selected; first image is the main image.</span>{uploading && <LoaderCircle className="animate-spin" size={15} />}</div><button disabled={busy || uploading} className="button-primary mt-5"><Save size={15} />{busy ? 'Saving...' : editing ? 'Save changes' : 'Create product'}</button></form>}
    {images.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{images.map((image, index) => <div key={image} className="flex items-center gap-2 border border-black/10 bg-canvas p-2 text-xs"><span className="font-bold">{index === 0 ? 'Main' : `Image ${index + 1}`}</span><span className="max-w-36 truncate text-muted">{image.split('/').at(-1)}</span><button type="button" aria-label="Move image up" onClick={() => moveImage(index, -1)}><ArrowUp size={14} /></button><button type="button" aria-label="Move image down" onClick={() => moveImage(index, 1)}><ArrowDown size={14} /></button><button type="button" aria-label="Delete image from Cloudinary" onClick={() => void removeImage(image)}><Trash2 size={14} /></button></div>)}</div>}
    <div className="mt-3 overflow-x-auto border border-black/10 bg-white"><table className="w-full min-w-[950px] text-left text-xs"><thead className="bg-[#e8ece8] uppercase text-muted"><tr>{['Product', 'Size / type', 'Condition', 'Depot', 'Price', 'Stock', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-black/5">{products.map((product) => <tr key={product.id}><td className="px-3 py-3 font-bold">{product.title}<small className="mt-1 block font-normal text-muted">/{product.slug}</small></td><td className="px-3 py-3">{product.size.replace('FT', '')} ft · {product.type.replaceAll('_', ' ')}</td><td className="px-3 py-3">{product.condition.replaceAll('_', ' ')}</td><td className="px-3 py-3">{product.location}</td><td className="px-3 py-3">{priceForContainerSize(product.size).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</td><td className="px-3 py-3"><input aria-label={`Stock for ${product.title}`} type="number" defaultValue={product.stockQuantity} className="h-8 w-16 border border-black/15 px-2" onBlur={(event) => { const stockQuantity = Number(event.target.value); if (stockQuantity !== product.stockQuantity) void updateProduct(product, { stockQuantity }); }} /></td><td className="px-3 py-3"><button onClick={() => void updateProduct(product, { status: product.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' })} className="font-bold hover:text-signal">{product.status}</button></td><td className="px-3 py-3"><div className="flex gap-2"><button aria-label={`Edit ${product.title}`} onClick={() => startEdit(product)} className="font-bold text-muted hover:text-signal">Edit</button><button aria-label={`Duplicate ${product.title}`} onClick={() => void duplicate(product)} className="text-muted hover:text-signal"><Copy size={15} /></button><button aria-label={`Delete ${product.title}`} onClick={() => void deleteProduct(product)} className="text-muted hover:text-red-700"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>
  </div>;
}