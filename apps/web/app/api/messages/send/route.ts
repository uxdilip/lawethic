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

        // Get user from session cookie
        const cookieStore = cookies();
        const allCookies = cookieStore.getAll();

        console.log('[Messages API] All cookies:', allCookies.map(c => c.name));

        // Find Appwrite session cookie
        const sessionCookie = allCookies.find(c =>
            c.name.startsWith('a_session_') ||
            c.name === 'appwrite-session' ||
            c.name.includes('session')
        );

        if (!sessionCookie) {
            console.error('[Messages API] No session cookie found');
            return NextResponse.json(
                { error: 'Unauthorized - Please login again' },
                { status: 401 }
            );
        }

        console.log('[Messages API] Using session cookie:', sessionCookie.name);

        // Check if API key is available
        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            console.error('[Messages API] APPWRITE_API_KEY is not set!');
            return NextResponse.json(
                { error: 'Server configuration error - API key missing' },
                { status: 500 }
            );
        }

        console.log('[Messages API] API key loaded:', apiKey.substring(0, 20) + '...');

        // Use admin client to get user info and create message
        const adminClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
            .setKey(apiKey);

        const databases = new Databases(adminClient);

        // Get user by verifying session via REST API
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '';

        const userResponse = await fetch(`${endpoint}/account`, {
            headers: {
                'X-Appwrite-Project': projectId,
                'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
            }
        });

        if (!userResponse.ok) {
            console.error('[Messages API] Failed to get user from session');
            return NextResponse.json(
                { error: 'Unauthorized - Invalid session' },
                { status: 401 }
            );
        }

        const user = await userResponse.json();
        console.log('[Messages API] User authenticated:', user.name);

        // Get user role from prefs or default to customer
        const userRole = (user.prefs?.role as string) || 'customer';

        // Create message
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
        console.error('[Messages API] Error sending message:', {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json(
            { error: error.message || 'Failed to send message' },
            { status: 500 }
        );
    }
}