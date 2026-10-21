'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { LockKeyhole } from 'lucide-react';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('');
    const data = new FormData(event.currentTarget);
    const result = await signIn('credentials', { email: data.get('email'), password: data.get('password'), callbackUrl: '/admin', redirect: false });
    setLoading(false);
    if (result?.error) setError('Email or password was not recognized.');
    else window.location.assign('/admin');
  }
  return <main className="container-shell grid min-h-[70vh] place-items-center py-12"><form onSubmit={submit} className="w-full max-w-md border border-black/10 bg-white p-8"><LockKeyhole className="text-signal" size={23} /><p className="eyebrow mt-5">STORAGE SOLVERS staff</p><h1 className="display-font mt-1 text-4xl font-bold uppercase">Admin sign in</h1><label className="mt-7 block text-xs font-bold">Email<input name="email" type="email" required autoComplete="username" className="mt-2 h-11 w-full border border-black/15 px-3 text-sm outline-none focus:border-signal" /></label><label className="mt-4 block text-xs font-bold">Password<input name="password" type="password" required autoComplete="current-password" className="mt-2 h-11 w-full border border-black/15 px-3 text-sm outline-none focus:border-signal" /></label>{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<button disabled={loading} className="button-primary mt-6 w-full">{loading ? 'Signing in...' : 'Sign in'}</button>{!process.env.NEXTAUTH_SECRET && <p className="mt-4 text-xs leading-5 text-muted">Set the required Auth.js environment variables and seed an admin user before signing in.</p>}</form></main>;
}