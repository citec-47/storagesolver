'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function InquiryEditor({ id, status, notes }: { id: string; status: string; notes: string }) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentNotes, setCurrentNotes] = useState(notes);
  const [message, setMessage] = useState('');
  async function save() {
    const response = await fetch(`/api/admin/inquiries/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: currentStatus, internalNotes: currentNotes }) });
    setMessage(response.ok ? 'Saved.' : 'Could not save changes.');
  }
  async function remove() {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    const response = await fetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
    if (response.ok) {
      router.push('/admin/inquiries');
      router.refresh();
    } else {
      setMessage('Could not delete inquiry.');
    }
  }
  return <aside className="h-fit border border-black/10 bg-white p-5"><label className="block text-xs font-bold">Status<select value={currentStatus} onChange={(event) => setCurrentStatus(event.target.value)} className="mt-2 h-10 w-full border border-black/15 bg-white px-3 text-sm">{['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST'].map((value) => <option key={value}>{value}</option>)}</select></label><label className="mt-5 block text-xs font-bold">Internal notes<textarea value={currentNotes} onChange={(event) => setCurrentNotes(event.target.value)} rows={8} className="mt-2 w-full border border-black/15 p-3 text-sm" /></label><button onClick={save} className="button-primary mt-4 w-full">Save inquiry</button><button onClick={remove} className="mt-3 w-full border border-red-300 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50">Delete inquiry</button>{message && <p className="mt-3 text-xs text-muted">{message}</p>}</aside>;
}