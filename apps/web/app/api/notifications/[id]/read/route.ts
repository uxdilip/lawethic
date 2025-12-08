import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';

const DATABASE_ID = 'main';
const NOTIFICATIONS_COLLECTION = 'notifications';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Use admin client
        const adminClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
            .setKey(process.env.APPWRITE_API_KEY || '');

        const databases = new Databases(adminClient);
        const notificationId = params.id;

        // Update notification to mark as read
        const updated = await databases.updateDocument(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION,
            notificationId,
            {
                read: true,
                readAt: new Date().toISOString()
            }
        );

        return NextResponse.json({
            success: true,
            notification: updated
        });

    } catch (error: any) {
        console.error('[Mark Read API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to mark notification as read' },
            { status: 500 }
        );
    }
}
