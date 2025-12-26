import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
import { getQuestionnaireById } from '@/data/questionnaires';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DATABASE_ID = 'main';
const QUESTIONNAIRE_COLLECTION = 'questionnaire_requests';

/**
 * GET /api/questionnaires/[orderId]
 * Get questionnaires for an order (pending/submitted)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Get all questionnaire requests for this order
        const requests = await databases.listDocuments(
            DATABASE_ID,
            QUESTIONNAIRE_COLLECTION,
            [
                Query.equal('orderId', orderId),
                Query.orderDesc('$createdAt')
            ]
        );

        // Enhance with template details
        const questionnaires = requests.documents.map((req: any) => {
            const template = getQuestionnaireById(req.templateId);
            return {
                $id: req.$id,
                orderId: req.orderId,
                templateId: req.templateId,
                templateName: template?.name || req.templateId,
                templateDescription: template?.description || '',
                status: req.status,
                sentBy: req.sentBy,
                sentByName: req.sentByName,
                sentAt: req.sentAt,
                submittedAt: req.submittedAt,
                notes: req.notes,
                hasTemplate: !!template,
                // Always include template for section-wise display
                template: template || undefined,
                // Include response data for submitted ones
                responseData: req.status !== 'pending' && req.responseData
                    ? JSON.parse(req.responseData)
                    : undefined
            };
        });

        return NextResponse.json({
            success: true,
            questionnaires,
            total: requests.total
        });

    } catch (error: any) {
        console.error('[Questionnaire] Error fetching:', error);
        console.error('[Questionnaire] Error code:', error.code);
        console.error('[Questionnaire] Error type:', error.type);
        return NextResponse.json(
            { error: 'Failed to fetch questionnaires', details: error.message },
            { status: 500 }
        );
    }
}
