import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { ID } from 'node-appwrite';

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

        // Notify assigned team member or all admins/operations
        const recipientUserId = order.assignedTo;

        if (recipientUserId) {
            // Notify assigned user
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.notifications,
                ID.unique(),
                {
                    userId: recipientUserId,
                    orderId: orderId,
                    type: 'document_uploaded',
                    title: 'Documents Uploaded',
                    description: `Customer has uploaded documents for order ${order.orderNumber}`,
                    message: `Documents have been uploaded for review`,
                    actionUrl: `/admin/cases/${orderId}`,
                    actionLabel: 'Review Documents',
                    read: false,
                    sourceUserId: order.customerId
                }
            );
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
