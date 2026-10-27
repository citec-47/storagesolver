'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function AdminSignOutButton() {
  return <button
    type="button"
    onClick={() => signOut({ callbackUrl: '/admin/login' })}
    className="mt-8 flex w-full items-center gap-2 border-t border-white/15 pt-4 text-left text-xs text-white/55 hover:text-white"
  >
    <LogOut size={15} />
    Sign out
  </button>;
}
