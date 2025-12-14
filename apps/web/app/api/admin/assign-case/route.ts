import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID } from 'node-appwrite';

const DATABASE_ID = 'main';

export async function POST(request: NextRequest) {
    try {
        const { orderId, assignedTo, assignedToName, currentUserId, currentUserName } = await request.json();

        if (!orderId || !currentUserId) {
            return NextResponse.json(
                { error: 'Order ID and current user ID are required' },
                { status: 400 }
            );
        }

        // Initialize admin client
        const adminClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
            .setKey(process.env.APPWRITE_API_KEY!);

        const adminDatabases = new Databases(adminClient);

        // Get order details
        const order = await adminDatabases.getDocument(DATABASE_ID, 'orders', orderId);
        const previousAssignment = order.assignedTo;

        // Update order assignment
        const updateData: any = {
            assignedAt: new Date().toISOString(),
            assignedBy: currentUserId
        };

        if (assignedTo) {
            updateData.assignedTo = assignedTo;
        } else {
            updateData.assignedTo = null;
        }

        await adminDatabases.updateDocument(
            DATABASE_ID,
            'orders',
            orderId,
            updateData
        );

        // Create timeline entry
        let timelineAction = '';
        let timelineDetails = '';

        if (!previousAssignment && assignedTo) {
            timelineAction = 'case_assigned';
            timelineDetails = `Case assigned to ${assignedToName || 'team member'}`;
        } else if (previousAssignment && !assignedTo) {
            timelineAction = 'case_unassigned';
            timelineDetails = `Case unassigned from previous owner`;
        } else if (previousAssignment && assignedTo && previousAssignment !== assignedTo) {
            timelineAction = 'case_reassigned';
            timelineDetails = `Case reassigned to ${assignedToName || 'team member'}`;
        }

        if (timelineAction) {
            await adminDatabases.createDocument(
                DATABASE_ID,
                'order_timeline',
                ID.unique(),
                {
                    orderId: orderId,
                    status: timelineAction,
                    note: timelineDetails,
                    updatedBy: currentUserId,
                    action: timelineAction,
                    details: timelineDetails,
                    performedBy: currentUserName || 'Admin'
                }
            );
        }

        // Send notification to assigned user
        if (assignedTo && assignedTo !== previousAssignment) {
            try {
                await adminDatabases.createDocument(
                    DATABASE_ID,
                    'notifications',
                    ID.unique(),
                    {
                        userId: assignedTo,
                        orderId: orderId,
                        type: 'case_assigned',
                        message: `New case assigned to you: Order #${order.orderNumber || orderId.slice(0, 8)}`,
                        title: 'Case Assigned',
                        description: `${currentUserName || 'Admin'} assigned a case to you. Please review and take action.`,
                        actionUrl: `/admin/cases/${orderId}`,
                        actionLabel: 'View Case',
                        read: false,
                        readAt: null,
                        sourceUserId: currentUserId,
                        metadata: null
                    }
                );
            } catch (notifError) {
                console.error('Failed to send notification:', notifError);
            }
        }

        return NextResponse.json({
            success: true,
            message: assignedTo ? 'Case assigned successfully' : 'Case unassigned successfully'
        });

    } catch (error: any) {
        console.error('[Assignment API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to assign case' },
            { status: 500 }
        );
    }
}
