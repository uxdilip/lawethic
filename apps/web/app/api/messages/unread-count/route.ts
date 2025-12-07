import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
import { cookies } from 'next/headers';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const MESSAGES_COLLECTION = 'messages';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        // Get user from session
        const cookieStore = cookies();
        const allCookies = cookieStore.getAll();

        const sessionCookie = allCookies.find(c =>
            c.name.startsWith('a_session_') ||
            c.name === 'appwrite-session' ||
            c.name.includes('session')
        );

        if (!sessionCookie) {
            return NextResponse.json(
                { error: 'Unauthorized - No session found' },
                { status: 401 }
            );
        }

        // Get current user
        const userClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '');

        userClient.headers['cookie'] = `${sessionCookie.name}=${sessionCookie.value}`;

        const { Account } = await import('node-appwrite');
        const account = new Account(userClient);
        const user = await account.get();

        // Use admin client to query messages
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
            .setKey(process.env.APPWRITE_API_KEY || '');

        const databases = new Databases(client);

        // Build query
        const queries = [
            Query.equal('read', false),
            Query.notEqual('senderId', user.$id) // Don't count own messages
        ];

        if (orderId) {
            queries.push(Query.equal('orderId', orderId));
        }

        // Count unread messages
        const unreadMessages = await databases.listDocuments(
            DATABASE_ID,
            MESSAGES_COLLECTION,
            queries
        );

        return NextResponse.json({
            success: true,
            unreadCount: unreadMessages.total,
            orderId: orderId || null
        });

    } catch (error: any) {
        console.error('[Messages API] Error getting unread count:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get unread count' },
            { status: 500 }
        );
    }
}
