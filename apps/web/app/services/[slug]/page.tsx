import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServiceBySlug, getAllServiceSlugs } from '@/data/services'
import { getServiceContent } from '@/lib/services/getServiceContent'
import ServicePageClient from './ServicePageClient'
import { ServiceSchema, FAQSchema, BreadcrumbSchema } from '@/components/StructuredData'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lawethic.com'

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
 * Uses database content if published, otherwise static
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const result = await getServiceContent(slug)

    if (!result) {
        return {
            title: 'Service Not Found | LawEthic',
        }
    }

    const service = result.service

    return {
        title: service.metaTitle,
        description: service.metaDescription,
        keywords: service.keywords,
        openGraph: {
            title: service.metaTitle,
            description: service.metaDescription,
            type: 'website',
            url: `${BASE_URL}/services/${slug}`,
            siteName: 'LAWethic',
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: service.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: service.metaTitle,
            description: service.metaDescription,
            images: ['/og-image.png'],
        },
        alternates: {
            canonical: `${BASE_URL}/services/${slug}`,
        },
    }
}

export default async function ServicePage({ params }: Props) {
    const { slug } = await params

    // Fetch service content (from DB if published, otherwise static)
    // This runs at BUILD time and on REVALIDATION (ISR)
    const result = await getServiceContent(slug)

    if (!result) {
        notFound()
    }

    const { service, source, version } = result

    // Breadcrumb data for structured data
    const breadcrumbs = [
        { name: 'Home', url: BASE_URL },
        { name: 'Services', url: `${BASE_URL}/services` },
        { name: service.title, url: `${BASE_URL}/services/${slug}` },
    ]

    return (
        <>
            {/* Structured Data for SEO */}
            <ServiceSchema
                name={service.title}
                description={service.metaDescription}
                price={service.basePrice}
                url={`${BASE_URL}/services/${slug}`}
                category={service.category}
            />
            {service.faqs && service.faqs.length > 0 && (
                <FAQSchema faqs={service.faqs} />
            )}
            <BreadcrumbSchema items={breadcrumbs} />

            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <div className="hidden">
                    Content source: {source}, Version: {version}
                </div>
            )}

            {/* Page Content */}
            <ServicePageClient service={service} />
        </>
    )
}
