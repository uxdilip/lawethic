import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite';
import { ServiceContent } from '@lawethic/appwrite/types';
import { SERVICES } from '@/data/services';

const { databaseId, collections } = appwriteConfig;

// GET /api/admin/services/[slug]/history - Get version history
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Get service title from static data
        const staticService = SERVICES.find(s => s.slug === slug);
        const serviceTitle = staticService?.title || slug;

        // Get all versions for this slug
        const historyDocs = await serverDatabases.listDocuments(
            databaseId,
            collections.serviceContentDrafts,
            [
                Query.equal('slug', slug),
                Query.orderDesc('version'),
                Query.limit(50),
            ]
        );

        // Map to the format expected by the history page
        const versions = historyDocs.documents.map(doc => {
            const content = doc as unknown as ServiceContent;
            return {
                $id: content.$id,
                version: content.version,
                status: content.status,
                editedBy: content.editedBy,
                changeNote: content.changeNote,
                publishedAt: content.publishedAt,
                createdAt: content.$createdAt,
                updatedAt: content.$updatedAt,
            };
        });

        return NextResponse.json({
            success: true,
            slug,
            serviceTitle,
            versions,
            total: versions.length,
        });
    } catch (error) {
        console.error('Error fetching version history:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch version history' },
            { status: 500 }
        );
    }
}
