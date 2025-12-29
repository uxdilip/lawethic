import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite';
import { SERVICES } from '@/data/services';
import { ServiceContent, ServiceContentData } from '@lawethic/appwrite/types';

const { databaseId, collections } = appwriteConfig;

// GET /api/admin/services - List all services with content status
export async function GET(request: NextRequest) {
    try {
        // Get all published/draft content from database
        const contentDocs = await serverDatabases.listDocuments(
            databaseId,
            collections.serviceContentDrafts,
            [
                Query.orderDesc('$updatedAt'),
            ]
        );

        // Create a map of slug -> latest content
        const contentMap = new Map<string, ServiceContent>();
        for (const doc of contentDocs.documents) {
            const content = doc as unknown as ServiceContent;
            const existing = contentMap.get(content.slug);
            // Keep the one with higher version or published status
            if (!existing || content.version > existing.version) {
                contentMap.set(content.slug, content);
            }
        }

        // Build service list from static registry
        const services = SERVICES.map(service => {
            const dbContent = contentMap.get(service.slug);

            return {
                slug: service.slug,
                title: service.title,
                category: service.category,
                basePrice: service.basePrice,
                // Content status
                hasContent: !!dbContent,
                contentStatus: dbContent?.status || null,
                contentVersion: dbContent?.version || 0,
                lastEditedAt: dbContent?.$updatedAt || null,
                publishedAt: dbContent?.publishedAt || null,
            };
        });

        return NextResponse.json({
            success: true,
            services,
            total: services.length,
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch services' },
            { status: 500 }
        );
    }
}
