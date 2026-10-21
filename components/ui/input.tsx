import type { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx('h-10 w-full border border-black/15 bg-white px-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-signal focus:ring-2 focus:ring-signal/15 disabled:opacity-50', className)} {...props} />;
}