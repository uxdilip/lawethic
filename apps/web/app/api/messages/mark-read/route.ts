import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
import { cookies } from 'next/headers';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const MESSAGES_COLLECTION = 'messages';

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { messageIds } = body;

        if (!messageIds || !Array.isArray(messageIds)) {
            return NextResponse.json(
                { error: 'messageIds array is required' },
                { status: 400 }
            );
        }

        // Get user from session
        const cookieStore = cookies();
        const allCookies = cookieStore.getAll();

        const sessionCookie = allCookies.find(c =>
            c.name.startsWith('a_session_') ||
            c.name === 'appwrite-session' ||
            c.name.includes('session')
        );

        if (!sessionCookie) {
            // Don't fail, just return success (non-critical)
            return NextResponse.json({
                success: true,
                updated: 0
            });
        }

        // Use admin client to update messages
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
            .setKey(process.env.APPWRITE_API_KEY || '');

        const databases = new Databases(client);

        // Mark messages as read
        const updatePromises = messageIds.map(messageId =>
            databases.updateDocument(
                DATABASE_ID,
                MESSAGES_COLLECTION,
                messageId,
                {
                    read: true,
                    readAt: new Date().toISOString()
                }
            )
        );

        await Promise.all(updatePromises);


        return NextResponse.json({
            success: true,
            updated: messageIds.length
        });

    } catch (error: any) {
        console.error('[Messages API] Error marking messages as read:', error);
        // Don't fail the request for this
        return NextResponse.json({
            success: true,
            updated: 0
        });
    }
}