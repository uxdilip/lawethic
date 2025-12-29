import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite';
import { ServiceContent } from '@lawethic/appwrite/types';

const { databaseId, collections } = appwriteConfig;

// POST /api/admin/services/[slug]/publish - Publish current draft
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;

        console.log('[Publish API] Publishing service:', slug);

        // Get the latest draft for this slug
        const draftDocs = await serverDatabases.listDocuments(
            databaseId,
            collections.serviceContentDrafts,
            [
                Query.equal('slug', slug),
                Query.equal('status', 'draft'),
                Query.orderDesc('version'),
                Query.limit(1),
            ]
        );

        console.log('[Publish API] Found drafts:', draftDocs.documents.length);

        if (draftDocs.documents.length === 0) {
            // Check if there's already a published version
            const publishedDocs = await serverDatabases.listDocuments(
                databaseId,
                collections.serviceContentDrafts,
                [
                    Query.equal('slug', slug),
                    Query.equal('status', 'published'),
                    Query.orderDesc('version'),
                    Query.limit(1),
                ]
            );

            if (publishedDocs.documents.length > 0) {
                const published = publishedDocs.documents[0] as unknown as ServiceContent;

                // Revalidate anyway to ensure page is up-to-date
                const servicePath = `/services/${slug}`;
                revalidatePath(servicePath);

                // Already published, return success
                return NextResponse.json({
                    success: true,
                    message: 'Content is already published',
                    contentId: published.$id,
                    version: published.version,
                    publishedAt: published.publishedAt,
                    alreadyPublished: true,
                    revalidated: servicePath,
                });
            }

            return NextResponse.json(
                { success: false, error: 'No draft found to publish. Save changes first.' },
                { status: 404 }
            );
        }

        const draft = draftDocs.documents[0] as unknown as ServiceContent;

        // Update draft to published
        const published = await serverDatabases.updateDocument(
            databaseId,
            collections.serviceContentDrafts,
            draft.$id,
            {
                status: 'published',
                publishedAt: new Date().toISOString(),
            }
        );

        console.log('[Publish API] Published successfully:', published.$id);

        // ISR: Revalidate the service page so it rebuilds with new content
        const servicePath = `/services/${slug}`;
        revalidatePath(servicePath);
        console.log('[Publish API] Revalidated path:', servicePath);

        return NextResponse.json({
            success: true,
            message: 'Content published successfully',
            contentId: published.$id,
            version: draft.version,
            publishedAt: published.publishedAt,
            revalidated: servicePath,
        });
    } catch (error) {
        console.error('[Publish API] Error publishing service content:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to publish content' },
            { status: 500 }
        );
    }
}
