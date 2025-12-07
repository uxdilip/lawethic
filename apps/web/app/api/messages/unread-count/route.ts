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
            // Return 0 if no session (non-critical)
            return NextResponse.json({
                success: true,
                unreadCount: 0,
                orderId: orderId || null
            });
        }

        // Get current user via REST API
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '';

        const userResponse = await fetch(`${endpoint}/account`, {
            headers: {
                'X-Appwrite-Project': projectId,
                'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
            }
        });

        if (!userResponse.ok) {
            // Return 0 if can't get user (non-critical)
            return NextResponse.json({
                success: true,
                unreadCount: 0,
                orderId: orderId || null
            });
        }

        const user = await userResponse.json();

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
        // Return 0 on error (non-critical)
        return NextResponse.json({
            success: true,
            unreadCount: 0,
            orderId: null
        });
    }
}