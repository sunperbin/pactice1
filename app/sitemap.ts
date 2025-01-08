import { MetadataRoute } from 'next'
import { coins } from '@/data/coins'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kimchipremium.com'

  // 기본 페이지들
  const staticPages = [
    '',
    '/about',
    '/terms',
    '/privacy',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // 코인 상세 페이지들
  const coinPages = coins.map(coin => ({
    url: `${baseUrl}/coins/${coin.symbol.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...coinPages]
}

