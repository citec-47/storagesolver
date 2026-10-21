'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { sizeOptions } from '@/lib/config';

const schema = z.object({ name: z.string().min(2, 'Enter your name'), email: z.string().email('Enter a valid email'), phone: z.string().min(7, 'Enter a phone number'), company: z.string().optional(), deliveryAddress: z.string().optional(), deliveryZip: z.string().optional(), size: z.string().min(1, 'Choose a size'), quantity: z.coerce.number().int().min(1).max(100), condition: z.string().optional(), message: z.string().max(2000).optional(), website: z.string().max(0).optional() });
type FormValues = z.infer<typeof schema>;

export function QuoteForm({ productSlug, initialSize }: { productSlug?: string; initialSize?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [cartItems, setCartItems] = useState<{ slug: string; quantity: number }[]>([]);
  useEffect(() => { try { setCartItems((JSON.parse(localStorage.getItem('container-inquiry-cart') ?? '[]') as (string | { slug: string; quantity: number })[]).map((item) => typeof item === 'string' ? { slug: item, quantity: 1 } : item)); } catch { setCartItems([]); } }, []);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { size: initialSize ?? 'FT20', quantity: 1, website: '' } });
  async function submit(values: FormValues) {
    setServerError('');
    try {
      const items = productSlug ? [{ slug: productSlug, quantity: values.quantity }] : cartItems;
      const response = await fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, items }) });
      const result = await response.json() as { success?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Submission failed.');
      try { localStorage.removeItem('container-inquiry-cart'); } catch { /* storage may be unavailable */ }
      setSubmitted(true);
    } catch (error) { setServerError(error instanceof Error ? error.message : 'Please try again.'); }
  }
  const field = 'mt-1 h-11 w-full border border-black/15 bg-white px-3 text-sm outline-none focus:border-signal';
  const label = 'block text-xs font-bold';
  if (submitted) return <div className="border border-[#b6d2be] bg-[#eaf3ec] p-7"><CheckCircle2 className="text-[#347044]" size={28} /><h2 className="display-font mt-3 text-3xl font-bold uppercase">Request received</h2><p className="mt-2 text-sm leading-6 text-muted">Thanks for getting in touch. Our container team will follow up shortly.</p></div>;
  return <form className="space-y-5" onSubmit={handleSubmit(submit)}>
    <div className="grid gap-4 sm:grid-cols-2"><label className={label}>Name *<input {...register('name')} className={field} autoComplete="name" />{errors.name && <small className="text-red-700">{errors.name.message}</small>}</label><label className={label}>Email *<input {...register('email')} className={field} type="email" autoComplete="email" />{errors.email && <small className="text-red-700">{errors.email.message}</small>}</label><label className={label}>Phone *<input {...register('phone')} className={field} type="tel" autoComplete="tel" />{errors.phone && <small className="text-red-700">{errors.phone.message}</small>}</label><label className={label}>Company<input {...register('company')} className={field} autoComplete="organization" /></label><label className={label}>Delivery address<input {...register('deliveryAddress')} className={field} autoComplete="street-address" /></label><label className={label}>Delivery ZIP<input {...register('deliveryZip')} className={field} autoComplete="postal-code" /></label><label className={label}>Container size *<select {...register('size')} className={`${field} bg-white`}><option value="">Select a size</option>{sizeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{errors.size && <small className="text-red-700">{errors.size.message}</small>}</label><label className={label}>Quantity<input {...register('quantity')} className={field} type="number" min="1" max="100" /></label></div>
    <label className={label}>Condition preference<select {...register('condition')} className={`${field} bg-white`}><option value="">No preference</option><option value="NEW">New</option><option value="ONE_TRIP">One-Trip</option><option value="CARGO_WORTHY">Used - Cargo Worthy</option><option value="WIND_WATER_TIGHT">Used - Wind & Water Tight</option><option value="AS_IS">As-Is</option></select></label>
    <label className={label}>Anything else we should know?<textarea {...register('message')} rows={4} className="mt-1 w-full border border-black/15 bg-white p-3 text-sm outline-none focus:border-signal" placeholder="Site access, timeline, preferred depot..." /></label>
    <label className="absolute -left-[9999px]" aria-hidden="true">Website<input {...register('website')} tabIndex={-1} autoComplete="off" /></label>
    {serverError && <p role="alert" className="text-sm text-red-700">{serverError}</p>}
    <button className="button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending request...' : 'Send quote request'} <ArrowRight size={16} /></button><p className="text-[11px] leading-5 text-muted">No obligation. We will only use your details to respond to this request.</p>
  </form>;
}