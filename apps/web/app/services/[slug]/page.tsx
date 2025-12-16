import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServiceBySlug, getAllServiceSlugs } from '@/data/services'
import ServicePageClient from './ServicePageClient'

interface Props {
    params: Promise<{ slug: string }>
}

/**
 * Generate static params for all services
 */
export async function generateStaticParams() {
    const slugs = getAllServiceSlugs()
    return slugs.map((slug) => ({ slug }))
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const service = getServiceBySlug(slug)

    if (!service) {
        return {
            title: 'Service Not Found | LawEthic',
        }
    }

    return {
        title: service.metaTitle,
        description: service.metaDescription,
        keywords: service.keywords,
        openGraph: {
            title: service.metaTitle,
            description: service.metaDescription,
            type: 'website',
        },
    }
}

export default async function ServicePage({ params }: Props) {
    const { slug } = await params
    const service = getServiceBySlug(slug)

    if (!service) {
        notFound()
    }

    // Pass full service object to new client component
    return <ServicePageClient service={service} />
}
