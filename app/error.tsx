'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="container-shell grid min-h-[60vh] place-items-center py-16 text-center"><div><p className="eyebrow">Something went wrong</p><h1 className="display-font mt-2 text-6xl font-bold uppercase">Let’s try that again.</h1><p className="mt-3 text-sm text-muted">The page could not be loaded right now.</p><button onClick={() => reset()} className="button-primary mt-6">Reload page</button></div></main>;
}