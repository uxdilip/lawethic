import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite';
import { Query } from 'node-appwrite';
import { ServiceContentData, ServiceContent } from '@lawethic/appwrite/types';
import { getServiceBySlug, Service as StaticService } from '@/data/services';

const { databaseId, collections } = appwriteConfig;

// Helper: Convert ServiceContentData back to Service format for public display
function mergeContentWithStatic(content: ServiceContentData, staticService: StaticService): StaticService {
    return {
        ...staticService,
        // Override with dynamic content where available
        title: content.title || staticService.title,
        shortTitle: content.shortTitle || staticService.shortTitle,
        category: content.category || staticService.category,
        categorySlug: content.categorySlug || staticService.categorySlug,
        basePrice: content.basePrice ?? staticService.basePrice,
        timeline: content.timeline || staticService.timeline,
        badge: content.badge || staticService.badge,
        hero: content.hero ? {
            badge: content.hero.badge ?? staticService.hero.badge,
            title: content.hero.title || staticService.hero.title,
            description: content.hero.description || staticService.hero.description,
            // Always use content highlights if hero exists (even if empty array)
            highlights: content.hero.highlights ?? staticService.hero.highlights,
            formTitle: content.hero.formTitle ?? staticService.hero.formTitle,
            formCta: content.hero.formCta ?? staticService.hero.formCta,
            // trustSignals - use content if any field is set, otherwise fall back to static
            trustSignals: content.hero.trustSignals ? {
                secure: (content.hero.trustSignals as any).secure ?? (staticService.hero.trustSignals as any)?.secure ?? '',
                fast: (content.hero.trustSignals as any).fast ?? (staticService.hero.trustSignals as any)?.fast ?? '',
                support: (content.hero.trustSignals as any).support ?? (staticService.hero.trustSignals as any)?.support ?? '',
            } : staticService.hero.trustSignals ? {
                secure: (staticService.hero.trustSignals as any).secure ?? '',
                fast: (staticService.hero.trustSignals as any).fast ?? '',
                support: (staticService.hero.trustSignals as any).support ?? '',
            } : undefined,
            // stats - use content if any field is set, otherwise fall back to defaults
            stats: content.hero.stats ? {
                count: content.hero.stats.count ?? '100%',
                countLabel: content.hero.stats.countLabel ?? 'Accuracy Guaranteed',
                rating: content.hero.stats.rating ?? 'Expert',
                ratingLabel: content.hero.stats.ratingLabel ?? 'Rating',
                timeline: content.hero.stats.timeline ?? '7-10',
                timelineLabel: content.hero.stats.timelineLabel ?? 'Working Days',
            } : undefined,
        } : staticService.hero,
        packages: content.packages?.length ? content.packages.map((pkg, i) => ({
            id: pkg.id || staticService.packages[i]?.id || `pkg-${i}`,
            name: pkg.name,
            price: pkg.price,
            originalPrice: pkg.originalPrice,
            discount: pkg.discount,
            timeline: pkg.timeline,
            featured: pkg.featured || false,
            inclusions: pkg.inclusions || [],
            exclusions: pkg.exclusions || [],
            emiAvailable: pkg.emiAvailable || false,
        })) : staticService.packages,
        overview: content.overview ? {
            title: content.overview.title || staticService.overview?.title || 'Overview',
            description: content.overview.description || staticService.overview?.description || '',
            highlights: content.overview.highlights?.length ? content.overview.highlights : staticService.overview?.highlights,
        } : staticService.overview,
        eligibility: content.eligibility ? {
            title: content.eligibility.title || staticService.eligibility?.title || '',
            description: content.eligibility.description || staticService.eligibility?.description || '',
            entities: content.eligibility.entities?.length ? content.eligibility.entities.map(e => ({
                name: e.name,
                icon: e.icon,
            })) : staticService.eligibility?.entities || [],
        } : staticService.eligibility,
        types: content.types ? {
            title: content.types.title || staticService.types?.title || '',
            description: content.types.description || staticService.types?.description || '',
            items: content.types.items?.length ? content.types.items.map(t => ({
                name: t.name,
                description: t.description,
                icon: t.icon,
            })) : staticService.types?.items || [],
        } : staticService.types,
        fees: content.fees ? {
            title: content.fees.title || staticService.fees?.title || '',
            description: content.fees.description || staticService.fees?.description || '',
            table: content.fees.table?.length ? content.fees.table.map(f => ({
                entityType: f.entityType,
                eFiling: f.eFiling,
                physical: f.physical,
                notes: f.notes,
            })) : staticService.fees?.table || [],
        } : staticService.fees,
        documents: content.documents ? {
            title: content.documents.title || staticService.documents?.title || '',
            description: content.documents.description || staticService.documents?.description || '',
            groups: content.documents.groups?.length ? content.documents.groups.map(g => ({
                entityType: g.entityType,
                items: g.items,
            })) : staticService.documents?.groups || [],
        } : staticService.documents,
        process: content.process?.length ? content.process.map(p => ({
            step: p.step,
            title: p.title,
            description: p.description,
            duration: p.duration,
            icon: p.icon,
        })) : staticService.process,
        benefits: content.benefits ? {
            title: content.benefits.title || staticService.benefits?.title || '',
            description: content.benefits.description || staticService.benefits?.description || '',
            items: content.benefits.items?.length ? content.benefits.items.map(b => ({
                title: b.title,
                description: b.description,
                icon: b.icon,
            })) : staticService.benefits?.items || [],
        } : staticService.benefits,
        faqs: content.faqs?.length ? content.faqs.map(f => ({
            question: f.question,
            answer: f.answer,
        })) : staticService.faqs,
        metaTitle: content.meta?.title || staticService.metaTitle,
        metaDescription: content.meta?.description || staticService.metaDescription,
        keywords: content.meta?.keywords || staticService.keywords,
        relatedServices: content.relatedServices || staticService.relatedServices,
    };
}

// Public API - returns merged content (DB + static fallback)
// GET /api/services/[slug]/content
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Get static service as base (required)
        const staticService = getServiceBySlug(slug);
        if (!staticService) {
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            );
        }

        // Try to get published content from DB
        try {
            const docs = await serverDatabases.listDocuments(
                databaseId,
                collections.serviceContentDrafts,
                [
                    Query.equal('slug', slug),
                    Query.equal('status', 'published'),
                    Query.orderDesc('version'),
                    Query.limit(1),
                ]
            );

            if (docs.documents.length > 0) {
                const dbContent = docs.documents[0] as unknown as ServiceContent;
                const contentData = JSON.parse(dbContent.content) as ServiceContentData;
                const mergedService = mergeContentWithStatic(contentData, staticService);

                return NextResponse.json({
                    success: true,
                    source: 'database',
                    service: mergedService,
                    version: dbContent.version,
                    publishedAt: dbContent.publishedAt,
                });
            }
        } catch (dbError) {
            // If database lookup fails, fall back to static content
            console.warn('Database lookup failed, using static content:', dbError);
        }

        // Return static service as fallback
        return NextResponse.json({
            success: true,
            source: 'static',
            service: staticService,
            version: 0,
        });

    } catch (error) {
        console.error('Error fetching service content:', error);

        // On any error, try static fallback
        try {
            const { slug } = await params;
            const staticService = getServiceBySlug(slug);

            if (staticService) {
                return NextResponse.json({
                    success: true,
                    source: 'static',
                    service: staticService,
                    version: 0,
                });
            }
        } catch { }

        return NextResponse.json(
            { error: 'Failed to fetch service content' },
            { status: 500 }
        );
    }
}
