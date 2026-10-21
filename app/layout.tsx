import type { Metadata } from 'next';
import './globals.css';
import { siteConfig } from '@/lib/config';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ContactFloat } from '@/components/contact-float';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: 'Shipping Containers for Sale | STORAGE SOLVERS INC.', template: '%s | STORAGE SOLVERS INC.' },
  description: siteConfig.description,
  openGraph: { title: 'Shipping Containers for Sale', description: siteConfig.description, type: 'website' }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader />{children}<SiteFooter /><ContactFloat /></body></html>;
}