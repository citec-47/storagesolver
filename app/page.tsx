import Link from 'next/link';
import { ArrowDownRight, ArrowRight, BadgeCheck, Boxes, Clock3, Truck } from 'lucide-react';
import { sizeOptions } from '@/lib/config';
import { getProducts } from '@/lib/products';
import { ProductCard } from '@/components/product-card';

export default async function HomePage() {
  const products = await getProducts();
  const featuredSlugs = ['ft20-one-trip-standard', 'ft45-high-cube-one-trip', 'ft40-one-trip-standard'];
  const featured = featuredSlugs.map((slug) => products.find((product) => product.slug === slug)).filter((product) => product !== undefined);
  const featuredPhotos = [
    { src: '/container-photos/featured-20ft.jpg', credit: 'IPLManagement · CC BY-SA 4.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:20_Foot_Shipping_Container_Storage_Yard.jpg' },
    { src: '/container-photos/featured-45ft.jpg', credit: 'IPLManagement · CC BY-SA 4.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:45_High_Cube_Shipping_Container_at_Yard.jpg' },
    { src: '/container-photos/featured-pair.jpg', credit: '1250metersdeep · CC0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Blue_and_grey_shipping_containers.jpg' }
  ];
  return <main>
    <section className="relative isolate min-h-[620px] overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-75" style={{ backgroundImage: "linear-gradient(90deg,rgba(11,20,25,.94) 0%,rgba(11,20,25,.72) 52%,rgba(11,20,25,.18) 100%),url('https://upload.wikimedia.org/wikipedia/commons/c/c0/Blue_and_grey_shipping_containers.jpg')" }} />
      <div className="container-shell flex min-h-[620px] items-center py-20">
        <div className="max-w-[660px] animate-rise">
          <p className="eyebrow mb-5">Built for work. Ready for yours.</p>
          <h1 className="display-font max-w-[640px] text-6xl font-bold uppercase leading-[.93] sm:text-7xl lg:text-[88px]">Space that<br /><span className="text-signal">moves you</span></h1>
          <p className="mt-6 max-w-[485px] text-base leading-7 text-white/80">Straightforward container sales, inspected inventory, and dependable delivery to your site.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link className="button-primary" href="/quote">Get a free quote <ArrowRight size={16} /></Link><Link className="button-secondary" href="/containers">Browse inventory</Link></div>
          <div className="mt-10 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-white/70"><span className="h-px w-10 bg-signal" /> Serving businesses and builders nationwide <ArrowDownRight size={15} /></div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 hidden h-28 w-[34%] bg-signal px-9 py-6 md:block"><p className="display-font text-3xl font-bold uppercase leading-none">Right container.<br />Right where you need it.</p></div>
    </section>

    <section className="container-shell py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Find your footprint</p><h2 className="display-font mt-2 text-4xl font-bold uppercase">Choose a size</h2></div><Link className="group inline-flex items-center gap-2 text-sm font-bold" href="/containers">View all inventory <ArrowRight className="transition group-hover:translate-x-1" size={16} /></Link></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{sizeOptions.map((option, index) => {
        const sizePhotos = ['/container-photos/10ft.jpg', '/container-photos/featured-20ft.jpg', '/container-photos/40ft.jpg', '/container-photos/featured-45ft.jpg', '/container-photos/featured-pair.jpg'];
        return <Link key={option.value} href={`/containers/${option.slug}`} className="group overflow-hidden border border-black/10 bg-white transition hover:-translate-y-1 hover:border-signal hover:shadow-soft"><img src={sizePhotos[index]} alt={`${option.label} shipping containers`} loading="lazy" className="h-36 w-full object-cover sm:h-40" /><div className="p-5"><span className="text-xs font-semibold text-muted">0{index + 1}</span><strong className="display-font mt-3 block text-4xl font-bold uppercase">{option.label}</strong><span className="mt-2 block text-xs text-muted">{option.use}</span><ArrowRight className="mt-5 text-signal transition group-hover:translate-x-1" size={17} /></div></Link>;
      })}</div>
    </section>

    <section className="bg-white py-20"><div className="container-shell"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="eyebrow">Available now</p><h2 className="display-font mt-2 text-4xl font-bold uppercase">Featured inventory</h2></div><Link className="hidden text-sm font-bold sm:block" href="/containers">All containers <ArrowRight className="ml-1 inline" size={16} /></Link></div><div className="grid gap-5 md:grid-cols-3">{featured.map((product, index) => <ProductCard key={product.id} product={product} featuredPhoto={featuredPhotos[index]} />)}</div></div></section>

    <section className="container-shell grid gap-12 py-20 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow">Why STORAGE SOLVERS</p><h2 className="display-font mt-2 text-5xl font-bold uppercase leading-[.94]">Good steel.<br />No surprises.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-muted">A container is a long-term tool. We make the purchase clear, the condition honest, and delivery predictable.</p><Link className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-signal" href="/about">Meet our team <ArrowRight size={16} /></Link></div><div className="grid gap-7 sm:grid-cols-3">{[{ icon: BadgeCheck, title: 'Inspected inventory', text: 'Clear condition grading and photos before you commit.' }, { icon: Truck, title: 'Delivery handled', text: 'Experienced drivers and placement planning at your site.' }, { icon: Clock3, title: 'Straight answers', text: 'A real person helps you compare options and timing.' }].map(({ icon: Icon, title, text }) => <article key={title} className="border-t-2 border-signal pt-5"><Icon className="text-signal" size={22} /><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{text}</p></article>)}</div></section>

    <section className="bg-ink py-20 text-white"><div className="container-shell"><div className="mb-10 max-w-xl"><p className="eyebrow">Simple from start to set-down</p><h2 className="display-font mt-2 text-4xl font-bold uppercase">Three steps to more space</h2></div><div className="grid gap-8 md:grid-cols-3">{[{ n: '01', title: 'Choose', text: 'Compare sizes, conditions, and available options.' }, { n: '02', title: 'Get a quote', text: 'Tell us where it is going and we will price delivery.' }, { n: '03', title: 'We deliver', text: 'Our team coordinates a safe, convenient drop-off.' }].map((step) => <div key={step.n} className="border-t border-white/20 pt-5"><span className="display-font text-4xl font-bold text-signal">{step.n}</span><h3 className="display-font mt-4 text-2xl font-bold uppercase">{step.title}</h3><p className="mt-2 max-w-xs text-sm leading-6 text-white/65">{step.text}</p></div>)}</div></div></section>

    <section className="container-shell grid gap-12 py-20 lg:grid-cols-2"><div><p className="eyebrow">Straight from our customers</p><h2 className="display-font mt-2 text-4xl font-bold uppercase">Built on good handoffs</h2><div className="mt-7 border-l-2 border-signal pl-5"><p className="text-lg leading-8">“The container arrived exactly as described, and the delivery driver made a tight site work look easy.”</p><p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted">Morgan R. · Contractor, Ohio</p></div></div><div className="bg-[#e8ece8] p-7 sm:p-9"><div className="mb-5 flex items-center gap-2"><Boxes className="text-signal" size={19} /><span className="eyebrow">Quick questions</span></div><details className="group border-t border-black/10 py-4" open><summary className="cursor-pointer list-none font-bold">Do you deliver to my location?<span className="float-right text-signal">+</span></summary><p className="mt-3 max-w-lg text-sm leading-6 text-muted">We deliver across the continental U.S. Share your ZIP code and we will confirm service and delivery pricing.</p></details><details className="group border-t border-black/10 py-4"><summary className="cursor-pointer list-none font-bold">Can I inspect before purchasing?<span className="float-right text-signal">+</span></summary><p className="mt-3 text-sm leading-6 text-muted">Yes. Ask us about depot visits and the inspection details for any listed unit.</p></details><details className="group border-y border-black/10 py-4"><summary className="cursor-pointer list-none font-bold">What does cargo worthy mean?<span className="float-right text-signal">+</span></summary><p className="mt-3 text-sm leading-6 text-muted">Cargo Worthy units are structurally sound and suitable for shipping, subject to inspection and applicable requirements.</p></details></div></section>

    <section className="bg-signal py-12 text-white"><div className="container-shell flex flex-wrap items-center justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-widest text-white/75">Ready to make room?</p><h2 className="display-font mt-1 text-4xl font-bold uppercase">Let’s price the right container.</h2></div><Link className="inline-flex min-h-12 items-center gap-2 bg-ink px-6 text-sm font-bold text-white" href="/quote">Request a quote <ArrowRight size={16} /></Link></div></section>
  </main>;
}