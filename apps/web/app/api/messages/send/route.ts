import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID } from 'node-appwrite';
import { cookies } from 'next/headers';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const MESSAGES_COLLECTION = 'messages';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, message } = body;

        if (!orderId || !message) {
            return NextResponse.json(
                { error: 'orderId and message are required' },
                { status: 400 }
            );
        }

        // Get user from session
        const cookieStore = cookies();
        const allCookies = cookieStore.getAll();

        // Find Appwrite session cookie
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

        // Create user client with session
        const userClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '');

        // Set session cookie
        userClient.headers['cookie'] = `${sessionCookie.name}=${sessionCookie.value}`;

        // Get current user
        const { Account } = await import('node-appwrite');
        const account = new Account(userClient);
        const user = await account.get();

        // Get user role from prefs or default to customer
        const userRole = (user.prefs?.role as string) || 'customer';

        // Create message using admin client
        const adminClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
            .setKey(process.env.APPWRITE_API_KEY || '');

        const databases = new Databases(adminClient);

        const newMessage = await databases.createDocument(
            DATABASE_ID,
            MESSAGES_COLLECTION,
            ID.unique(),
            {
                orderId,
                senderId: user.$id,
                senderName: user.name || 'User',
                senderRole: userRole,
                message: message.trim(),
                messageType: 'text',
                read: false,
                readAt: null,
                metadata: null
            }
        );

        console.log('[Messages API] Message sent:', {
            messageId: newMessage.$id,
            orderId,
            sender: user.name,
            role: userRole
        });

        return NextResponse.json({
            success: true,
            message: newMessage
        });

    } catch (error: any) {
        console.error('[Messages API] Error sending message:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send message' },
            { status: 500 }
        );
    }
}
