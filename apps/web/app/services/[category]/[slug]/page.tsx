import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServiceData, getAllServicePaths } from '@/lib/services-static'
import { ServicePageClient } from './ServicePageClient'

interface PageProps {
    params: {
        category: string
        slug: string
    }
}

// Generate static params for all services
export async function generateStaticParams() {
    const paths = getAllServicePaths()
    return paths.map(({ category, slug }) => ({
        category,
        slug,
    }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const service = await getServiceData(params.category, params.slug)

    if (!service) {
        return {
            title: 'Service Not Found',
        }
    }

    return {
        title: service.metaTitle || `${service.title} | LawEthic`,
        description: service.metaDescription,
        keywords: service.keywords,
        openGraph: {
            title: service.metaTitle || service.title,
            description: service.metaDescription,
            type: 'website',
        },
    }
}

export default async function ServicePage({ params }: PageProps) {
    const service = await getServiceData(params.category, params.slug)

    if (!service) {
        notFound()
    }

    // Transform ServiceData to ServiceDetail format for ServicePageClient
    const serviceDetail = {
        $id: service.slug,
        slug: service.slug,
        category: service.category,
        title: service.title,
        shortDescription: service.metaDescription,
        price: service.basePrice,
        hero: {
            badge: service.hero.badge || undefined,
            title: service.hero.title,
            highlights: service.hero.highlights,
            trustSignals: {
                rating: '4.5/5 Google Rating',
                served: '100,000+ Businesses Served',
                certified: service.hero.badge || 'Certified Platform'
            }
        },
        contentBlocks: {
            packages: service.packages.map(pkg => ({
                ...pkg,
                cta: 'Get Started',
                originalPrice: Math.round(pkg.price * 1.5),
                discount: '33% off',
                popular: pkg.featured,
                emiAvailable: pkg.price > 2000
            })),
            process: service.process,
            documents: service.documents.required.map(doc => ({
                applicantType: doc.applicableFor,
                items: [doc.title]
            })),
            education: {
                overview: service.metaDescription,
                eligibility: [],
                benefits: service.hero.highlights
            },
            faqs: service.faqs,
            socialProof: {
                rating: 4.5,
                reviewCount: 19000,
                totalServed: 100000,
                tagline: "We're registering companies every 5 minutes!"
            }
        },
        questionForm: null,
        metaTitle: service.metaTitle,
        metaDescription: service.metaDescription,
        keywords: service.keywords,
    }

    return <ServicePageClient service={serviceDetail} />
}
