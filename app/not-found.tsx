import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() { return <main className="container-shell grid min-h-[60vh] place-items-center py-16 text-center"><div><p className="eyebrow">404 · Not found</p><h1 className="display-font mt-2 text-7xl font-bold uppercase">That unit is gone.</h1><p className="mt-3 text-sm text-muted">The page may have moved or the listing is no longer available.</p><Link href="/containers" className="button-primary mt-6"><ArrowLeft size={15} />Browse inventory</Link></div></main>; }