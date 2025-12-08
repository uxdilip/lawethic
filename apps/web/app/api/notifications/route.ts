import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

const DATABASE_ID = 'main';
const NOTIFICATIONS_COLLECTION = 'notifications';

export async function GET(request: NextRequest) {
    try {
        // Use admin client
        const adminClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
            .setKey(process.env.APPWRITE_API_KEY || '');

        const databases = new Databases(adminClient);

        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        // Build queries
        const queries = [
            Query.equal('userId', userId),
            Query.orderDesc('$createdAt'),
            Query.limit(limit),
            Query.offset(offset)
        ];

        if (unreadOnly) {
            queries.push(Query.equal('read', false));
        }

        // Fetch notifications
        const response = await databases.listDocuments(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION,
            queries
        );

        // Get unread count
        const unreadResponse = await databases.listDocuments(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION,
            [
                Query.equal('userId', userId),
                Query.equal('read', false),
                Query.limit(100) // Limit for count
            ]
        );

        return NextResponse.json({
            success: true,
            notifications: response.documents,
            total: response.total,
            unreadCount: unreadResponse.total
        });

    } catch (error: any) {
        console.error('[Notifications API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}
