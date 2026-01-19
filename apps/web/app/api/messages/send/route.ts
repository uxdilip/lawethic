import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID, Users } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const MESSAGES_COLLECTION = 'messages';
const CONSULTATION_CASES_COLLECTION = 'consultation_cases';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            orderId,
            message = '',
            attachments = [],
            isConsultation = false,
            // Client passes sender info (they've already auth'd with Appwrite SDK)
            senderId,
            senderName,
            senderRole = 'customer'
        } = body;

        console.log('[Messages API] Request body:', {
            orderId,
            messageLength: message?.length,
            attachmentsCount: attachments.length,
            isConsultation,
            senderId,
            senderName,
            senderRole
        });

        if (!orderId || (!message && (!attachments || attachments.length === 0))) {
            return NextResponse.json(
                { error: 'orderId and either message or attachments are required' },
                { status: 400 }
            );
        }

        if (!senderId || !senderName) {
            return NextResponse.json(
                { error: 'senderId and senderName are required' },
                { status: 400 }
            );
        }

        // Check if API key is available
        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            console.error('[Messages API] APPWRITE_API_KEY is not set!');
            return NextResponse.json(
                { error: 'Server configuration error - API key missing' },
                { status: 500 }
            );
        }

        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '';

        // Use admin client for database operations
        const adminClient = new Client()
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey);

        const databases = new Databases(adminClient);

        // Verify sender has access to this consultation/order
        if (isConsultation) {
            try {
                const consultation = await databases.getDocument(
                    DATABASE_ID,
                    CONSULTATION_CASES_COLLECTION,
                    orderId
                );
                // For consultations, verify the sender is either the customer or staff
                // Check by customerId OR by email (for cases created as guest then logged in)
                const isCustomerById = consultation.customerId === senderId;
                const isCustomerByEmail = body.senderEmail && consultation.customerEmail === body.senderEmail;
                const isCustomer = isCustomerById || isCustomerByEmail;
                const isStaff = senderRole === 'admin' || senderRole === 'operations';

                console.log('[Messages API] Auth check:', {
                    customerId: consultation.customerId,
                    customerEmail: consultation.customerEmail,
                    senderId,
                    senderEmail: body.senderEmail,
                    isCustomerById,
                    isCustomerByEmail,
                    isCustomer,
                    senderRole,
                    isStaff
                });

                // If customer is identified by email but customerId is 'guest', update it
                if (isCustomerByEmail && consultation.customerId === 'guest' && senderId) {
                    try {
                        await databases.updateDocument(
                            DATABASE_ID,
                            CONSULTATION_CASES_COLLECTION,
                            orderId,
                            { customerId: senderId }
                        );
                        console.log('[Messages API] Updated consultation customerId from guest to:', senderId);
                    } catch (updateErr) {
                        console.error('[Messages API] Failed to update customerId:', updateErr);
                    }
                }

                if (!isCustomer && !isStaff) {
                    console.error('[Messages API] User not authorized for this consultation');
                    return NextResponse.json(
                        { error: 'Not authorized to send messages in this consultation' },
                        { status: 403 }
                    );
                }
            } catch (err: any) {
                console.error('[Messages API] Failed to verify consultation access:', err.message);
                return NextResponse.json(
                    { error: 'Consultation not found' },
                    { status: 404 }
                );
            }
        }

        // Create message - use the same schema as ChatPanel.tsx (which works)
        const messageData: Record<string, any> = {
            orderId,
            senderId,
            senderName,
            senderRole,
            message: message?.trim() || '',
            messageType: attachments && attachments.length > 0 ? 'file' : 'text',
            read: false,
            readAt: null,
            metadata: attachments && attachments.length > 0 ? JSON.stringify({ attachments }) : null,
        };

        const newMessage = await databases.createDocument(
            DATABASE_ID,
            MESSAGES_COLLECTION,
            ID.unique(),
            messageData
        );

        console.log('[Messages API] Message created:', newMessage.$id);

        // Send notification to the other person in conversation
        try {
            let customerId: string | null = null;
            let assignedAdminId: string | null = null;
            let actionUrl: string = '';

            if (isConsultation) {
                // Get consultation case to find customer info (we already verified access above)
                const consultation = await databases.getDocument(DATABASE_ID, CONSULTATION_CASES_COLLECTION, orderId);
                customerId = consultation.customerId; // Customer's ID (ConsultationCase uses 'customerId')
                // Consultations don't have assignedTo field, so admin notifications go to all staff
                assignedAdminId = null;

                // Set action URLs based on sender role
                if (senderRole === 'customer') {
                    actionUrl = `/admin/consultations/${orderId}`;
                } else {
                    actionUrl = `/dashboard/consultations/${orderId}`;
                }
            } else {
                // Get order to find the other person's userId
                const order = await databases.getDocument(DATABASE_ID, 'orders', orderId);
                customerId = order.userId; // Customer's userId
                assignedAdminId = order.assignedTo; // Assigned admin's userId

                if (senderRole === 'customer') {
                    actionUrl = `/admin/cases/${orderId}`;
                } else {
                    actionUrl = `/orders/${orderId}`;
                }
            }

            const baseNotificationData = {
                orderId: orderId,
                type: 'message',
                message: attachments.length > 0
                    ? `${senderName} sent ${attachments.length} file(s)`
                    : `New message from ${senderName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
                title: 'New Message',
                description: attachments.length > 0
                    ? `${senderName} sent you ${attachments.length} attachment(s)`
                    : `${senderName} sent you a message`,
                actionLabel: 'View Message',
                read: false,
                readAt: null,
                sourceUserId: senderId,
                metadata: null
            };

            // Determine recipient based on sender role
            if (senderRole === 'customer') {
                // Customer sending message -> notify assigned admin or all staff
                // actionUrl already set above based on isConsultation

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
                // actionUrl already set above based on isConsultation

                if (customerId && customerId !== senderId) {
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