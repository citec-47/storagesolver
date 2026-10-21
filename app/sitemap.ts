import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/products';
import { siteConfig, sizeOptions } from '@/lib/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/containers', '/delivery', '/about', '/faq', '/contact', '/quote', '/terms', '/privacy'];
  const products = await getProducts();
  return [
    ...staticRoutes.map((route) => ({ url: `${siteConfig.url}${route}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: route === '' ? 1 : 0.7 })),
    ...sizeOptions.map((size) => ({ url: `${siteConfig.url}/containers/${size.slug}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 })),
    ...products.map((product) => ({ url: `${siteConfig.url}/containers/${product.slug}`, lastModified: product.createdAt, changeFrequency: 'daily' as const, priority: 0.8 }))
  ];
}