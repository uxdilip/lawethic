import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { serverDatabases } from '@lawethic/appwrite/server'
import { appwriteConfig } from '@lawethic/appwrite/config'
import { Query } from 'node-appwrite'
import { ServiceDetail } from '@/types/service-content'
import { ServicePageClient } from './ServicePageClient'

interface PageProps {
    params: {
        category: string
        slug: string
    }
}

async function getService(slug: string): Promise<ServiceDetail | null> {
    try {
        const response = await serverDatabases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.services,
            [Query.equal('slug', slug), Query.limit(1)]
        )

        if (response.documents.length === 0) {
            return null
        }

        const doc = response.documents[0]

        // Parse contentBlocks JSON
        const contentBlocks = doc.contentBlocks
            ? JSON.parse(doc.contentBlocks)
            : null

        // Parse heroHighlights and keywords if they exist
        const heroHighlights = doc.heroHighlights || []
        const keywords = doc.keywords || []

        return {
            $id: doc.$id,
            slug: doc.slug,
            category: doc.category || '',
            title: doc.title,
            shortDescription: doc.shortDescription || doc.description || '',
            price: doc.price,
            hero: {
                badge: doc.heroBadge,
                title: doc.heroTitle || doc.title,
                highlights: heroHighlights,
                trustSignals: {
                    rating: '4.5/5 Google Rating',
                    served: '10,000+ Businesses Served',
                    certified: doc.heroBadge
                }
            },
            contentBlocks,
            questionForm: doc.questionForm ? JSON.parse(doc.questionForm) : null,
            metaTitle: doc.metaTitle,
            metaDescription: doc.metaDescription,
            keywords,
        } as ServiceDetail
    } catch (error) {
        console.error('Error fetching service:', error)
        return null
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const service = await getService(params.slug)

    if (!service) {
        return {
            title: 'Service Not Found',
        }
    }

    return {
        title: service.metaTitle || `${service.title} | LawEthic`,
        description: service.metaDescription || service.shortDescription,
        keywords: service.keywords,
        openGraph: {
            title: service.metaTitle || service.title,
            description: service.metaDescription || service.shortDescription,
            type: 'website',
        },
    }
}

export default async function ServicePage({ params }: PageProps) {
    const service = await getService(params.slug)

    if (!service || !service.contentBlocks) {
        notFound()
    }

    return <ServicePageClient service={service} />
}
