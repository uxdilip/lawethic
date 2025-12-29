import { NextRequest, NextResponse } from 'next/server';
import { Query, ID } from 'node-appwrite';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite';
import { ServiceContent } from '@lawethic/appwrite/types';

const { databaseId, collections } = appwriteConfig;

// POST /api/admin/services/[slug]/revert/[version] - Revert to a specific version
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; version: string }> }
) {
    try {
        const { slug, version } = await params;
        const targetVersion = parseInt(version, 10);

        if (isNaN(targetVersion)) {
            return NextResponse.json(
                { success: false, error: 'Invalid version number' },
                { status: 400 }
            );
        }

        // Get the target version
        const targetDocs = await serverDatabases.listDocuments(
            databaseId,
            collections.serviceContentDrafts,
            [
                Query.equal('slug', slug),
                Query.equal('version', targetVersion),
                Query.limit(1),
            ]
        );

        if (targetDocs.documents.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Version not found' },
                { status: 404 }
            );
        }

        const targetDoc = targetDocs.documents[0] as unknown as ServiceContent;

        // Get the latest version number
        const latestDocs = await serverDatabases.listDocuments(
            databaseId,
            collections.serviceContentDrafts,
            [
                Query.equal('slug', slug),
                Query.orderDesc('version'),
                Query.limit(1),
            ]
        );

        const latestVersion = latestDocs.documents.length > 0
            ? (latestDocs.documents[0] as unknown as ServiceContent).version
            : 0;

        // Create a new draft with the reverted content
        const newVersion = latestVersion + 1;
        const created = await serverDatabases.createDocument(
            databaseId,
            collections.serviceContentDrafts,
            ID.unique(),
            {
                slug,
                version: newVersion,
                status: 'draft',
                content: targetDoc.content, // Copy content from target version
                editedBy: 'admin', // TODO: Get from session
                changeNote: `Reverted to version ${targetVersion}`,
            }
        );

        return NextResponse.json({
            success: true,
            message: `Reverted to version ${targetVersion}`,
            contentId: created.$id,
            newVersion,
        });
    } catch (error) {
        console.error('Error reverting version:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to revert version' },
            { status: 500 }
        );
    }
}
