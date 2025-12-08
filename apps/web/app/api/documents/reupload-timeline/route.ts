import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID } from 'node-appwrite';

const DATABASE_ID = 'main';

export async function POST(request: NextRequest) {
    try {
        const { orderId, fileName, version, userName, userId, assignedTo } = await request.json();

        if (!orderId || !fileName || !userName || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Initialize admin client
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
            .setKey(process.env.APPWRITE_API_KEY!);

        const databases = new Databases(client);

        // Create timeline entry
        await databases.createDocument(
            DATABASE_ID,
            'order_timeline',
            ID.unique(),
            {
                orderId: orderId,
                status: 'document_reuploaded',
                note: `Customer re-uploaded document: ${fileName} (Version ${version})`,
                updatedBy: userId,
                action: 'document_reupload',
                details: `Document re-uploaded by customer. Previous version rejected. Now pending review.`,
                performedBy: userName
            }
        );

        // Send notification to admin/operations
        try {
            await databases.createDocument(
                DATABASE_ID,
                'notifications',
                ID.unique(),
                {
                    userId: assignedTo || 'admin',
                    orderId: orderId,
                    type: 'message',
                    message: `Customer re-uploaded document: ${fileName}`,
                    title: 'Document Re-uploaded',
                    description: `${userName} has re-uploaded a rejected document. Please review.`,
                    actionUrl: `/admin/cases/${orderId}`,
                    actionLabel: 'Review Document',
                    read: false,
                    readAt: null,
                    sourceUserId: userId,
                    metadata: null
                }
            );
        } catch (notifError) {
            console.error('Failed to send notification:', notifError);
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Timeline API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create timeline entry' },
            { status: 500 }
        );
    }
}
