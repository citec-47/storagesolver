import type { SelectHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx('h-10 w-full border border-black/15 bg-white px-3 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/15', className)} {...props} />;
}