import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID, Users } from 'node-appwrite';
import { cookies } from 'next/headers';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const MESSAGES_COLLECTION = 'messages';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, message = '', attachments = [] } = body;

        console.log('[Messages API] Request body:', { orderId, messageLength: message?.length, attachmentsCount: attachments.length });

        if (!orderId || (!message && (!attachments || attachments.length === 0))) {
            return NextResponse.json(
                { error: 'orderId and either message or attachments are required' },
                { status: 400 }
            );
        }

        // Get cookies from request headers instead of cookies() helper
        const cookieHeader = request.headers.get('cookie');
        console.log('[Messages API] Cookie header:', cookieHeader ? 'Present' : 'Missing');

        if (!cookieHeader) {
            console.error('[Messages API] No cookie header found');
            return NextResponse.json(
                { error: 'Unauthorized - Please login again' },
                { status: 401 }
            );
        }

        // Parse cookies from header
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split('=');
            acc[name] = value;
            return acc;
        }, {} as Record<string, string>);

        console.log('[Messages API] Parsed cookies:', Object.keys(cookies));

        // Find Appwrite session cookie
        const sessionCookieName = Object.keys(cookies).find(name =>
            name.startsWith('a_session_') ||
            name === 'appwrite-session' ||
            name.includes('session')
        );

        if (!sessionCookieName) {
            console.error('[Messages API] No session cookie found');
            console.error('[Messages API] Available cookies:', Object.keys(cookies));
            return NextResponse.json(
                { error: 'Unauthorized - Please login again' },
                { status: 401 }
            );
        }

        const sessionCookieValue = cookies[sessionCookieName];
        console.log('[Messages API] Using session cookie:', sessionCookieName);


        // Check if API key is available
        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            console.error('[Messages API] APPWRITE_API_KEY is not set!');
            return NextResponse.json(
                { error: 'Server configuration error - API key missing' },
                { status: 500 }
            );
        }


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
                'Cookie': `${sessionCookieName}=${sessionCookieValue}`
            }
        });

        console.log('[Messages API] User validation response status:', userResponse.status);

        if (!userResponse.ok) {
            console.error('[Messages API] Failed to get user from session');
            console.error('[Messages API] Response status:', userResponse.status);
            const errorText = await userResponse.text();
            console.error('[Messages API] Response body:', errorText);
            return NextResponse.json(
                { error: 'Unauthorized - Invalid session' },
                { status: 401 }
            );
        }

        const user = await userResponse.json();

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
                message: message?.trim() || '',
                messageType: attachments.length > 0 ? 'file' : 'text',
                read: false,
                readAt: null,
                metadata: attachments.length > 0 ? JSON.stringify({ attachments }) : null
            }
        );

        // Send notification to the other person in conversation
        try {
            // Get order to find the other person's userId
            const order = await databases.getDocument(DATABASE_ID, 'orders', orderId);
            const customerId = order.userId; // Customer's userId
            const assignedAdminId = order.assignedTo; // Assigned admin's userId

            let actionUrl: string = '';
            const baseNotificationData = {
                orderId: orderId,
                type: 'message',
                message: attachments.length > 0
                    ? `${user.name} sent ${attachments.length} file(s)`
                    : `New message from ${user.name}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
                title: 'New Message',
                description: attachments.length > 0
                    ? `${user.name} sent you ${attachments.length} attachment(s)`
                    : `${user.name} sent you a message`,
                actionLabel: 'View Message',
                read: false,
                readAt: null,
                sourceUserId: user.$id,
                metadata: null
            };

            // Determine recipient based on sender role
            if (userRole === 'customer') {
                // Customer sending message -> notify assigned admin or all staff
                actionUrl = `/admin/cases/${orderId}`;

                if (assignedAdminId) {
                    // Notify assigned admin
                    await databases.createDocument(
                        DATABASE_ID,
                        'notifications',
                        ID.unique(),
                        {
                            ...baseNotificationData,
                            userId: assignedAdminId,
                            actionUrl: actionUrl
                        }
                    );
                    console.log('[Messages API] ✅ Notification sent to assigned admin:', assignedAdminId);
                } else {
                    // No assignee - notify ALL admin/operations users
                    const usersClient = new Users(adminClient);
                    const allUsers = await usersClient.list();

                    const staffUsers = allUsers.users.filter(u => {
                        const role = u.prefs?.role;
                        return role === 'admin' || role === 'operations';
                    });

                    console.log('[Messages API] No assignee, notifying', staffUsers.length, 'staff members');

                    for (const staffUser of staffUsers) {
                        try {
                            await databases.createDocument(
                                DATABASE_ID,
                                'notifications',
                                ID.unique(),
                                {
                                    ...baseNotificationData,
                                    userId: staffUser.$id,
                                    actionUrl: actionUrl
                                }
                            );
                            console.log('[Messages API] ✅ Notified staff:', staffUser.email);
                        } catch (err) {
                            console.error('[Messages API] Failed to notify:', staffUser.email);
                        }
                    }
                }
            } else {
                // Admin/operations sending message -> notify customer
                actionUrl = `/orders/${orderId}`;

                if (customerId && customerId !== user.$id) {
                    await databases.createDocument(
                        DATABASE_ID,
                        'notifications',
                        ID.unique(),
                        {
                            ...baseNotificationData,
                            userId: customerId,
                            actionUrl: actionUrl
                        }
                    );
                    console.log('[Messages API] ✅ Notification sent to customer:', customerId);
                }
            }
        } catch (notifError: any) {
            console.error('[Messages API] ❌ Failed to send notification:');
            console.error('[Messages API] Error message:', notifError.message);
            console.error('[Messages API] Error code:', notifError.code);
            console.error('[Messages API] Error type:', notifError.type);
            // Non-critical, continue
        }

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