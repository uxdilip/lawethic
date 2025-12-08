import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

const DATABASE_ID = 'main';
const NOTIFICATIONS_COLLECTION = 'notifications';

export async function PATCH(request: NextRequest) {
    try {
        // Use admin client
        const adminClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
            .setKey(process.env.APPWRITE_API_KEY || '');

        const databases = new Databases(adminClient);

        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        // Get all unread notifications for user
        const unreadNotifications = await databases.listDocuments(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION,
            [
                Query.equal('userId', userId),
                Query.equal('read', false),
                Query.limit(100) // Limit batch operations
            ]
        );

        // Update each notification to mark as read
        const updatePromises = unreadNotifications.documents.map(notification =>
            databases.updateDocument(
                DATABASE_ID,
                NOTIFICATIONS_COLLECTION,
                notification.$id,
                {
                    read: true,
                    readAt: new Date().toISOString()
                }
            )
        );

        await Promise.all(updatePromises);

        return NextResponse.json({
            success: true,
            updated: unreadNotifications.documents.length
        });

    } catch (error: any) {
        console.error('[Mark All Read API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to mark all notifications as read' },
            { status: 500 }
        );
    }
}
