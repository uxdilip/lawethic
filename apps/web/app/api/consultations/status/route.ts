import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';

async function updateStatus(request: NextRequest) {
    try {
        const body = await request.json();
        const { caseId, status, expertNotes } = body;

        if (!caseId || !status) {
            return NextResponse.json(
                { error: 'Case ID and status are required' },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = [
            'submitted', 'under_review', 'pending_assignment',
            'meeting_scheduled', 'meeting_completed',
            'recommendations_sent', 'converted', 'cancelled', 'closed'
        ];

        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Build update data
        const updateData: Record<string, any> = { status };

        if (expertNotes !== undefined) {
            updateData.expertNotes = expertNotes;
        }

        // Update the case using server SDK
        const updatedCase = await serverDatabases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.consultationCases,
            caseId,
            updateData
        );

        return NextResponse.json({
            success: true,
            case: updatedCase
        });

    } catch (error: any) {
        console.error('Error updating consultation status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update consultation status' },
            { status: 500 }
        );
    }
}

// Support both PATCH and POST methods
export async function PATCH(request: NextRequest) {
    return updateStatus(request);
}

export async function POST(request: NextRequest) {
    return updateStatus(request);
}
