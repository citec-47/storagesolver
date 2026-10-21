import type { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' };
export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  const variants = { default: 'bg-signal text-white hover:bg-signal-dark', outline: 'border border-black/20 bg-white text-ink hover:border-signal', ghost: 'text-ink hover:bg-black/5' };
  return <button className={clsx('inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-50', variants[variant], className)} {...props} />;
}