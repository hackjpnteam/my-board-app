import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://board.huntercity.org',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
} 