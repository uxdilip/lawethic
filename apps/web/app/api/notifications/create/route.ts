import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID } from 'node-appwrite';
import { CreateNotificationData } from '@/lib/notifications/types';

const DATABASE_ID = 'main';
const NOTIFICATIONS_COLLECTION = 'notifications';

export async function POST(request: NextRequest) {
    try {
        const body: any = await request.json();

        const { userId, orderId, type, message, title, description, actionUrl, actionLabel, sourceUserId, metadata } = body;

        if (!userId || !orderId || !type || !message) {
            return NextResponse.json(
                { error: 'Missing required fields (userId, orderId, type, message)' },
                { status: 400 }
            );
        }

        // Use admin client to create notification
        const adminClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
            .setKey(process.env.APPWRITE_API_KEY || '');

        const databases = new Databases(adminClient);

        // Create notification
        const notification = await databases.createDocument(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION,
            ID.unique(),
            {
                userId,
                orderId,
                type,
                message,
                title: title || null,
                description: description || null,
                actionUrl: actionUrl || null,
                actionLabel: actionLabel || null,
                read: false,
                readAt: null,
                sourceUserId: sourceUserId || null,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        );

        return NextResponse.json({
            success: true,
            notification
        });

    } catch (error: any) {
        console.error('[Create Notification API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create notification' },
            { status: 500 }
        );
    }
}
