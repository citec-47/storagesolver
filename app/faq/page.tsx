import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = { title: 'Container Buying FAQs', description: 'Answers about shipping container sizes, condition, delivery, and quotes.' };
const questions = [
  ['What container sizes do you sell?', 'Inventory includes 10ft, 20ft, 40ft, 45ft, and 53ft containers. Availability varies by depot and condition.'],
  ['What does One-Trip mean?', 'One-Trip containers have typically made a single cargo trip from their point of manufacture. They are a strong choice when appearance and condition matter.'],
  ['What is the difference between Standard and High Cube?', 'High Cube containers are approximately one foot taller externally, providing additional interior clearance and capacity.'],
  ['Is delivery included in the listed price?', 'Listed prices are for the container. Delivery depends on distance, access, equipment, and placement needs. Request a quote with your ZIP code for an accurate delivered price.'],
  ['How do I prepare for delivery?', 'Arrange firm, level ground and a clear approach with sufficient turning and overhead clearance. Our team will discuss site access before scheduling.'],
  ['Can I request multiple containers at once?', 'Yes. Add products to your inquiry list and submit one combined request, or tell us the sizes and quantities on the quote form.']
];
export default function FaqPage() {
  return <main className="container-shell min-h-[70vh] py-14"><p className="eyebrow">Good questions</p><h1 className="display-font mt-2 text-6xl font-bold uppercase">Frequently asked</h1><div className="mt-8 max-w-3xl border-t border-black/15">{questions.map(([question, answer]) => <details key={question} className="border-b border-black/15 py-5"><summary className="cursor-pointer list-none pr-7 font-bold">{question}<span className="float-right text-signal">+</span></summary><p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{answer}</p></details>)}</div><Link href="/quote" className="button-primary mt-8">Ask us directly <ArrowRight size={15} /></Link></main>;
}