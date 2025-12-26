import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID } from 'node-appwrite';
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
 * POST /api/questionnaires/submit
 * Client submits filled questionnaire
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { questionnaireId, responseData, submittedBy, submittedByName } = body;

        // Validate required fields
        if (!questionnaireId || !responseData || !submittedBy) {
            return NextResponse.json(
                { error: 'Missing required fields: questionnaireId, responseData, submittedBy' },
                { status: 400 }
            );
        }

        // Get the questionnaire request
        let questionnaireRequest;
        try {
            questionnaireRequest = await databases.getDocument(
                DATABASE_ID,
                QUESTIONNAIRE_COLLECTION,
                questionnaireId
            );
        } catch (e) {
            return NextResponse.json(
                { error: 'Questionnaire request not found' },
                { status: 404 }
            );
        }

        // Check if already submitted
        if (questionnaireRequest.status !== 'pending') {
            return NextResponse.json(
                { error: 'This questionnaire has already been submitted' },
                { status: 409 }
            );
        }

        // Get template for validation
        const template = getQuestionnaireById(questionnaireRequest.templateId);
        if (!template) {
            return NextResponse.json(
                { error: 'Questionnaire template not found' },
                { status: 404 }
            );
        }

        // Validate required fields
        const missingFields: string[] = [];
        for (const section of template.sections) {
            for (const field of section.fields) {
                if (field.required && !responseData[field.id]) {
                    missingFields.push(field.label);
                }
            }
        }

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    error: 'Missing required fields',
                    missingFields
                },
                { status: 400 }
            );
        }

        // Update questionnaire request
        await databases.updateDocument(
            DATABASE_ID,
            QUESTIONNAIRE_COLLECTION,
            questionnaireId,
            {
                status: 'submitted',
                submittedAt: new Date().toISOString(),
                responseData: JSON.stringify(responseData)
            }
        );

        // Get order for timeline/notification
        const order = await databases.getDocument(
            DATABASE_ID,
            ORDERS_COLLECTION,
            questionnaireRequest.orderId
        );

        // Add timeline entry
        await databases.createDocument(
            DATABASE_ID,
            TIMELINE_COLLECTION,
            ID.unique(),
            {
                orderId: questionnaireRequest.orderId,
                status: order.status,
                note: `Questionnaire "${template.name}" submitted by client`,
                updatedBy: submittedByName || 'Customer'
            }
        );

        // Notify operations team (notify the person who sent the questionnaire)
        await databases.createDocument(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION,
            ID.unique(),
            {
                userId: questionnaireRequest.sentBy,
                orderId: questionnaireRequest.orderId,
                type: 'status_update',
                title: 'Questionnaire Submitted',
                message: `Client has submitted "${template.name}" for order ${order.orderNumber}`,
                description: null,
                read: false,
                readAt: null,
                sourceUserId: submittedBy,
                metadata: null,
                actionUrl: `/admin/cases/${questionnaireRequest.orderId}`,
                actionLabel: 'Review Response'
            }
        );

        console.log(`[Questionnaire] Submitted ${questionnaireId} for order ${questionnaireRequest.orderId}`);

        return NextResponse.json({
            success: true,
            message: 'Questionnaire submitted successfully'
        });

    } catch (error: any) {
        console.error('[Questionnaire] Error submitting:', error);
        return NextResponse.json(
            { error: 'Failed to submit questionnaire', details: error.message },
            { status: 500 }
        );
    }
}
