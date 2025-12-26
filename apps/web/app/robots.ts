import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lawethic.com'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/admin/*',
                    '/dashboard/',
                    '/dashboard/*',
                    '/api/',
                    '/api/*',
                    '/checkout/',
                    '/onboarding/',
                    '/*.json$',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/dashboard/',
                    '/api/',
                    '/checkout/',
                    '/onboarding/',
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    }
}
