import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { ID } from 'node-appwrite';

export async function POST(request: NextRequest) {
    try {
        const { orderId, userId, documentCount, orderStatus } = await request.json();

        if (!orderId || !userId || !documentCount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Update order status to in_review if currently pending_docs or new
        if (orderStatus === 'pending_docs' || orderStatus === 'new') {
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                orderId,
                {
                    status: 'in_review'
                }
            );
        }

        // Create timeline entry
        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.orderTimeline,
            ID.unique(),
            {
                orderId,
                action: 'documents_uploaded',
                details: `Customer uploaded ${documentCount} document(s)`,
                performedBy: userId,
                status: 'in_review',
                note: `Documents uploaded for review`,
                updatedBy: userId
            }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to process document upload:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process upload' },
            { status: 500 }
        );
    }
}
