import Link from 'next/link';
import { ArrowRight, Boxes, ClipboardList, PackageCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { demoProducts } from '@/lib/demo-data';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  if (!await getServerSession(authOptions) && process.env.DATABASE_URL) redirect('/admin/login');
  let products = demoProducts.length;
  let inStock = demoProducts.filter((product) => product.stockQuantity > 0).length;
  let newInquiries = 0;
  let recent: { id: string; name: string; email: string; createdAt: Date; status: string }[] = [];
  if (process.env.DATABASE_URL) {
    try {
      [products, inStock, newInquiries, recent] = await Promise.all([
        prisma.product.count(), prisma.product.count({ where: { status: 'ACTIVE', stockQuantity: { gt: 0 } } }),
        prisma.inquiry.count({ where: { status: 'NEW' } }), prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, name: true, email: true, createdAt: true, status: true } })
      ]);
    } catch (error) { console.error('Admin dashboard database unavailable', error); }
  }
  const stats = [{ title: 'Total products', value: products, icon: Boxes }, { title: 'In stock', value: inStock, icon: PackageCheck }, { title: 'New inquiries', value: newInquiries, icon: ClipboardList }];
  return <><div className="mb-6 flex items-end justify-between"><div><p className="eyebrow">Operations</p><h1 className="display-font mt-1 text-4xl font-bold uppercase">Dashboard</h1></div><Link href="/" className="text-xs font-bold text-muted hover:text-signal">View storefront <ArrowRight className="ml-1 inline" size={14} /></Link></div><div className="grid gap-3 sm:grid-cols-3">{stats.map(({ title, value, icon: Icon }) => <article key={title} className="border border-black/10 bg-white p-5"><Icon className="text-signal" size={19} /><p className="mt-5 text-xs font-bold uppercase tracking-wide text-muted">{title}</p><strong className="display-font mt-1 block text-4xl font-bold">{value}</strong></article>)}</div><section className="mt-7 border border-black/10 bg-white"><div className="flex items-center justify-between border-b border-black/10 px-5 py-4"><div><p className="eyebrow">Latest requests</p><h2 className="mt-1 font-bold">Recent inquiries</h2></div><Link href="/admin/inquiries" className="text-xs font-bold text-signal">View all <ArrowRight className="ml-1 inline" size={13} /></Link></div>{recent.length ? <div className="divide-y divide-black/5">{recent.map((inquiry) => <Link key={inquiry.id} href={`/admin/inquiries/${inquiry.id}`} className="flex flex-wrap justify-between gap-3 px-5 py-4 hover:bg-canvas"><span><strong className="block text-sm">{inquiry.name}</strong><span className="text-xs text-muted">{inquiry.email}</span></span><span className="text-right"><strong className="block text-xs uppercase">{inquiry.status}</strong><time className="text-xs text-muted">{inquiry.createdAt.toLocaleDateString()}</time></span></Link>)}</div> : <p className="px-5 py-9 text-sm text-muted">No saved inquiries yet. Live quote submissions appear here after database setup.</p>}</section></>;
}