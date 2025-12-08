import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = 'main';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { documentId, action, reason, orderId, customerId } = body;

        if (!documentId || !action || !orderId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Update document status
        const updateData: any = {
            status: action === 'verify' ? 'verified' : 'rejected',
        };

        // Only set rejectionReason when rejecting
        if (action === 'reject' && reason) {
            updateData.rejectionReason = reason;
        }

        try {
            await databases.updateDocument(
                DATABASE_ID,
                'documents',
                documentId,
                updateData
            );
        } catch (updateError: any) {
            console.error('[Document Update] Error:', updateError);
            return NextResponse.json(
                { error: `Failed to update document: ${updateError.message}` },
                { status: 500 }
            );
        }

        // Create timeline entry
        await databases.createDocument(
            DATABASE_ID,
            'order_timeline',
            ID.unique(),
            {
                orderId: orderId,
                status: action === 'verify' ? 'document_verified' : 'document_rejected',
                note: action === 'verify'
                    ? 'Document verified by admin'
                    : `Document rejected by admin. Reason: ${reason || 'No reason provided'}`,
                updatedBy: 'admin',
                action: 'document_' + action,
                details: action === 'verify'
                    ? 'Document verified'
                    : `Document rejected: ${reason}`,
                performedBy: 'admin',
            }
        );

        // Send notification to customer
        if (customerId) {
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    'notifications',
                    ID.unique(),
                    {
                        userId: customerId,
                        orderId: orderId,
                        type: action === 'verify' ? 'document_verified' : 'document_rejected',
                        message: action === 'verify'
                            ? 'Your document has been verified successfully'
                            : `Your document was rejected. Reason: ${reason}`,
                        title: action === 'verify' ? 'Document Verified' : 'Document Rejected',
                        description: action === 'verify'
                            ? 'Your submitted document has been reviewed and approved'
                            : `Document needs to be re-uploaded. Reason: ${reason}`,
                        actionUrl: `/orders/${orderId}`,
                        actionLabel: 'View Details',
                        read: false,
                        readAt: null,
                        sourceUserId: null,
                        metadata: null
                    }
                );
            } catch (notifError) {
                console.error('Failed to send notification:', notifError);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Document ${action === 'verify' ? 'verified' : 'rejected'} successfully`
        });

    } catch (error: any) {
        console.error('[Document Action API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process document action' },
            { status: 500 }
        );
    }
}
