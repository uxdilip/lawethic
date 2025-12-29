import { NextRequest, NextResponse } from 'next/server';
import { Query, ID } from 'node-appwrite';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite';
import { SERVICES, Service as StaticService } from '@/data/services';
import { ServiceContent, ServiceContentData } from '@lawethic/appwrite/types';

const { databaseId, collections } = appwriteConfig;

// Helper: Convert static service to ServiceContentData
function staticToContentData(service: StaticService): ServiceContentData {
    return {
        title: service.title,
        shortTitle: service.shortTitle,
        category: service.category,
        categorySlug: service.categorySlug,
        basePrice: service.basePrice,
        timeline: service.timeline,
        badge: service.badge || undefined,
        hero: {
            badge: service.hero.badge,
            title: service.hero.title,
            description: service.hero.description,
            highlights: service.hero.highlights,
            formTitle: service.hero.formTitle,
            formCta: service.hero.formCta,
            trustSignals: service.hero.trustSignals ? {
                secure: (service.hero.trustSignals as any).secure || '',
                fast: (service.hero.trustSignals as any).fast || '',
                support: (service.hero.trustSignals as any).support || '',
            } : undefined,
        },
        packages: service.packages.map(pkg => ({
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            originalPrice: pkg.originalPrice,
            discount: pkg.discount,
            timeline: pkg.timeline,
            featured: pkg.featured,
            inclusions: pkg.inclusions,
            exclusions: pkg.exclusions,
            emiAvailable: pkg.emiAvailable,
        })),
        overview: service.overview ? {
            title: service.overview.title,
            description: service.overview.description,
            highlights: service.overview.highlights,
        } : undefined,
        eligibility: service.eligibility ? {
            title: service.eligibility.title,
            description: service.eligibility.description,
            entities: service.eligibility.entities.map(e => ({
                name: e.name,
                icon: e.icon,
            })),
        } : undefined,
        types: service.types ? {
            title: service.types.title,
            description: service.types.description,
            items: service.types.items.map(t => ({
                name: t.name,
                description: t.description,
                icon: t.icon,
            })),
        } : undefined,
        fees: service.fees ? {
            title: service.fees.title,
            description: service.fees.description,
            table: service.fees.table.map(f => ({
                entityType: f.entityType,
                eFiling: f.eFiling,
                physical: f.physical,
                notes: f.notes,
            })),
        } : undefined,
        documents: service.documents ? {
            title: service.documents.title,
            description: service.documents.description,
            groups: service.documents.groups.map(g => ({
                entityType: g.entityType,
                items: g.items,
            })),
        } : undefined,
        process: service.process?.map(p => ({
            step: p.step,
            title: p.title,
            description: p.description,
            duration: p.duration,
            icon: p.icon,
        })),
        benefits: service.benefits ? {
            title: service.benefits.title,
            description: service.benefits.description,
            items: service.benefits.items.map(b => ({
                title: b.title,
                description: b.description,
                icon: b.icon,
            })),
        } : undefined,
        faqs: service.faqs?.map(f => ({
            question: f.question,
            answer: f.answer,
        })),
        meta: {
            title: service.metaTitle,
            description: service.metaDescription,
            keywords: service.keywords,
        },
        relatedServices: service.relatedServices,
    };
}

// GET /api/admin/services/[slug] - Get service content for editing
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Find static service
        const staticService = SERVICES.find(s => s.slug === slug);
        if (!staticService) {
            return NextResponse.json(
                { success: false, error: 'Service not found' },
                { status: 404 }
            );
        }

        // Check for existing content in database
        const contentDocs = await serverDatabases.listDocuments(
            databaseId,
            collections.serviceContentDrafts,
            [
                Query.equal('slug', slug),
                Query.orderDesc('version'),
                Query.limit(1),
            ]
        );

        let content: ServiceContentData;
        let version = 0;
        let status: 'draft' | 'published' | 'new' = 'new';
        let publishedAt: string | null = null;
        let contentId: string | null = null;

        if (contentDocs.documents.length > 0) {
            const dbContent = contentDocs.documents[0] as unknown as ServiceContent;
            content = JSON.parse(dbContent.content);
            version = dbContent.version;
            status = dbContent.status;
            publishedAt = dbContent.publishedAt || null;
            contentId = dbContent.$id;
        } else {
            // Use static content as starting point
            content = staticToContentData(staticService);
        }

        return NextResponse.json({
            success: true,
            slug,
            content,
            version,
            status,
            publishedAt,
            contentId,
        });
    } catch (error) {
        console.error('Error fetching service content:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch service content' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/services/[slug] - Save service content (draft)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const { content, changeNote } = body as {
            content: ServiceContentData;
            changeNote?: string;
        };

        // Validate slug exists
        const staticService = SERVICES.find(s => s.slug === slug);
        if (!staticService) {
            return NextResponse.json(
                { success: false, error: 'Service not found' },
                { status: 404 }
            );
        }

        // Get current version
        const existingDocs = await serverDatabases.listDocuments(
            databaseId,
            collections.serviceContentDrafts,
            [
                Query.equal('slug', slug),
                Query.orderDesc('version'),
                Query.limit(1),
            ]
        );

        let currentVersion = 0;
        let existingDraft: ServiceContent | null = null;

        if (existingDocs.documents.length > 0) {
            const existing = existingDocs.documents[0] as unknown as ServiceContent;
            currentVersion = existing.version;

            // If existing is a draft, update it instead of creating new
            if (existing.status === 'draft') {
                existingDraft = existing;
            }
        }

        // Get admin user ID from cookie (simplified - in production verify session)
        const cookieHeader = request.headers.get('cookie') || '';
        const editedBy = 'admin'; // TODO: Extract from session

        const contentJson = JSON.stringify(content);

        if (existingDraft) {
            // Update existing draft
            const updated = await serverDatabases.updateDocument(
                databaseId,
                collections.serviceContentDrafts,
                existingDraft.$id,
                {
                    content: contentJson,
                    editedBy,
                    changeNote: changeNote || null,
                }
            );

            return NextResponse.json({
                success: true,
                message: 'Draft updated',
                contentId: updated.$id,
                version: existingDraft.version,
            });
        } else {
            // Create new draft
            const newVersion = currentVersion + 1;
            const created = await serverDatabases.createDocument(
                databaseId,
                collections.serviceContentDrafts,
                ID.unique(),
                {
                    slug,
                    version: newVersion,
                    status: 'draft',
                    content: contentJson,
                    editedBy,
                    changeNote: changeNote || null,
                }
            );

            return NextResponse.json({
                success: true,
                message: 'Draft created',
                contentId: created.$id,
                version: newVersion,
            });
        }
    } catch (error) {
        console.error('Error saving service content:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save service content' },
            { status: 500 }
        );
    }
}
