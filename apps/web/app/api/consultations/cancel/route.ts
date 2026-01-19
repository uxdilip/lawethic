import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { addHours, isAfter } from 'date-fns';
import { sendConsultationCancelledEmail } from '@/lib/email/email-service';

const DATABASE_ID = appwriteConfig.databaseId;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { caseId } = body;

        if (!caseId) {
            return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
        }

        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const client = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.project)
            .setKey(apiKey);

        const databases = new Databases(client);

        // Get the case
        const caseData = await databases.getDocument(
            DATABASE_ID,
            appwriteConfig.collections.consultationCases,
            caseId
        );

        if (!caseData) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 });
        }

        // Check if case has a scheduled meeting
        if (caseData.status !== 'meeting_scheduled' || !caseData.scheduledAt) {
            return NextResponse.json({ error: 'No scheduled meeting to cancel' }, { status: 400 });
        }

        // Check if cancellation is within 24-hour window
        const meetingTime = new Date(caseData.scheduledAt);
        const cancelDeadline = addHours(new Date(), 24);

        if (!isAfter(meetingTime, cancelDeadline)) {
            return NextResponse.json(
                { error: 'Cannot cancel within 24 hours of the scheduled meeting' },
                { status: 400 }
            );
        }

        // Find and cancel the booking
        const bookings = await databases.listDocuments(
            DATABASE_ID,
            appwriteConfig.collections.consultationBookings,
            [
                Query.equal('caseId', caseId),
                Query.equal('status', 'scheduled'),
            ]
        );

        // Update booking status to cancelled
        if (bookings.documents.length > 0) {
            await databases.updateDocument(
                DATABASE_ID,
                appwriteConfig.collections.consultationBookings,
                bookings.documents[0].$id,
                { status: 'cancelled' }
            );
        }

        // Update case status
        await databases.updateDocument(
            DATABASE_ID,
            appwriteConfig.collections.consultationCases,
            caseId,
            {
                status: 'cancelled',
                scheduledAt: null,
                meetingLink: null,
            }
        );

        // Send cancellation email
        try {
            await sendConsultationCancelledEmail(
                caseData.customerEmail,
                caseData.customerName,
                caseData.caseNumber
            );
        } catch (emailError) {
            console.error('[Cancel] Failed to send email:', emailError);
        }

        return NextResponse.json({
            success: true,
            message: 'Consultation cancelled successfully',
        });
    } catch (error: any) {
        console.error('[Cancel] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to cancel' }, { status: 500 });
    }
}
