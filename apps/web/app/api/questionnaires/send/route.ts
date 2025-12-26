import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID, Query } from 'node-appwrite';
import { getQuestionnaireById } from '@/data/questionnaires';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DATABASE_ID = 'main';
const QUESTIONNAIRE_COLLECTION = 'questionnaire_requests';
const ORDERS_COLLECTION = 'orders';
const TIMELINE_COLLECTION = 'order_timeline';
const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * POST /api/questionnaires/send
 * Operations team sends a questionnaire to a client
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, templateId, sentBy, sentByName, notes } = body;

        // Validate required fields
        if (!orderId || !templateId || !sentBy || !sentByName) {
            return NextResponse.json(
                { error: 'Missing required fields: orderId, templateId, sentBy, sentByName' },
                { status: 400 }
            );
        }

        // Get the template to verify it exists
        const template = getQuestionnaireById(templateId);
        if (!template) {
            return NextResponse.json(
                { error: `Questionnaire template not found: ${templateId}` },
                { status: 404 }
            );
        }

        // Verify order exists
        let order;
        try {
            order = await databases.getDocument(DATABASE_ID, ORDERS_COLLECTION, orderId);
        } catch (e) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if there's already a pending questionnaire for this order
        const existingRequests = await databases.listDocuments(
            DATABASE_ID,
            QUESTIONNAIRE_COLLECTION,
            [
                Query.equal('orderId', orderId),
                Query.equal('templateId', templateId),
                Query.equal('status', 'pending')
            ]
        );

        if (existingRequests.documents.length > 0) {
            return NextResponse.json(
                { error: 'A questionnaire of this type is already pending for this order' },
                { status: 409 }
            );
        }

        // Create questionnaire request
        const questionnaireRequest = await databases.createDocument(
            DATABASE_ID,
            QUESTIONNAIRE_COLLECTION,
            ID.unique(),
            {
                orderId,
                templateId,
                status: 'pending',
                sentBy,
                sentByName,
                sentAt: new Date().toISOString(),
                notes: notes || null
            }
        );

        // Add timeline entry (non-blocking)
        try {
            await databases.createDocument(
                DATABASE_ID,
                TIMELINE_COLLECTION,
                ID.unique(),
                {
                    orderId,
                    status: order.status,
                    note: `Questionnaire "${template.name}" sent to client`,
                    updatedBy: sentByName
                }
            );
        } catch (timelineError) {
            console.error('[Questionnaire] Failed to add timeline entry:', timelineError);
        }

        // Create notification for customer (non-blocking)
        try {
            await databases.createDocument(
                DATABASE_ID,
                NOTIFICATIONS_COLLECTION,
                ID.unique(),
                {
                    userId: order.customerId,
                    orderId,
                    type: 'docs_requested',
                    title: 'Questionnaire Required',
                    message: `Please fill out the "${template.name}" for your order ${order.orderNumber}`,
                    description: notes || null,
                    actionUrl: `/orders/${orderId}`,
                    actionLabel: 'Fill Questionnaire',
                    read: false,
                    readAt: null,
                    sourceUserId: sentBy,
                    metadata: null
                }
            );
        } catch (notifError) {
            console.error('[Questionnaire] Failed to create notification:', notifError);
        }

        console.log(`[Questionnaire] Sent ${templateId} for order ${orderId} by ${sentByName}`);

        return NextResponse.json({
            success: true,
            questionnaireId: questionnaireRequest.$id,
            message: 'Questionnaire sent successfully'
        });

    } catch (error: any) {
        console.error('[Questionnaire] Error sending:', error);
        console.error('[Questionnaire] Error code:', error.code);
        console.error('[Questionnaire] Error type:', error.type);
        console.error('[Questionnaire] Full error:', JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Failed to send questionnaire', details: error.message, code: error.code, type: error.type },
            { status: 500 }
        );
    }
}
