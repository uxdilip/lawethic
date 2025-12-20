import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { ID, Client, Users } from 'node-appwrite';

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Get order details
        const order = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.orders,
            orderId
        );

        const recipientUserId = order.assignedTo;
        const notificationData = {
            orderId: orderId,
            type: 'document_uploaded',
            title: 'Documents Uploaded',
            description: `Customer has uploaded documents for order ${order.orderNumber}`,
            message: `Documents have been uploaded for review`,
            actionUrl: `/admin/cases/${orderId}`,
            actionLabel: 'Review Documents',
            read: false,
            sourceUserId: order.userId || order.customerId
        };

        if (recipientUserId) {
            // Notify assigned user
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.notifications,
                ID.unique(),
                {
                    ...notificationData,
                    userId: recipientUserId
                }
            );
            console.log('[Upload Notification] Notified assigned user:', recipientUserId);
        } else {
            // No assignee - notify ALL admin/operations users
            const client = new Client()
                .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
                .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
                .setKey(process.env.APPWRITE_API_KEY!);

            const users = new Users(client);
            const allUsers = await users.list();

            // Filter users with admin or operations role
            const staffUsers = allUsers.users.filter(user => {
                const role = user.prefs?.role;
                return role === 'admin' || role === 'operations';
            });

            console.log('[Upload Notification] No assignee, notifying', staffUsers.length, 'staff members');

            // Create notification for each staff member
            for (const staffUser of staffUsers) {
                try {
                    await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.collections.notifications,
                        ID.unique(),
                        {
                            ...notificationData,
                            userId: staffUser.$id
                        }
                    );
                    console.log('[Upload Notification] Notified:', staffUser.email);
                } catch (err) {
                    console.error('[Upload Notification] Failed to notify:', staffUser.email, err);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to create notification:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create notification' },
            { status: 500 }
        );
    }
}
