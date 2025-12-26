import { MetadataRoute } from 'next'
import { getAllServices } from '@/data/services'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lawethic.com'

export default function sitemap(): MetadataRoute.Sitemap {
    const services = getAllServices()

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/services`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/signup`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        // Add more static pages as needed
        // {
        //     url: `${BASE_URL}/about`,
        //     lastModified: new Date(),
        //     changeFrequency: 'monthly',
        //     priority: 0.7,
        // },
        // {
        //     url: `${BASE_URL}/contact`,
        //     lastModified: new Date(),
        //     changeFrequency: 'monthly',
        //     priority: 0.7,
        // },
    ]

    // Dynamic service pages
    const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
        url: `${BASE_URL}/services/${service.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [...staticPages, ...servicePages]
}
