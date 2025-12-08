import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';

const DATABASE_ID = 'main';
const NOTIFICATIONS_COLLECTION = 'notifications';

export async function DELETE(
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

        await databases.deleteDocument(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION,
            notificationId
        );

        return NextResponse.json({
            success: true
        });

    } catch (error: any) {
        console.error('[Delete Notification API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete notification' },
            { status: 500 }
        );
    }
}
