import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { sendMeetingScheduledEmail } from '@/lib/email/email-service';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { caseId, meetingLink, scheduledAt } = body;

        if (!caseId || !meetingLink || !scheduledAt) {
            return NextResponse.json(
                { error: 'Missing required fields: caseId, meetingLink, scheduledAt' },
                { status: 400 }
            );
        }

        // Initialize admin client
        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const adminClient = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.project)
            .setKey(apiKey);

        const databases = new Databases(adminClient);

        // Get case data
        const caseData = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.consultationCases,
            caseId
        );

        // Update case with meeting details
        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.consultationCases,
            caseId,
            {
                meetingLink,
                scheduledAt,
                status: 'meeting_scheduled',
            }
        );

        // Format date and time for email
        const scheduledDate = new Date(scheduledAt);
        const meetingDate = format(scheduledDate, 'EEEE, MMMM d, yyyy');
        const meetingTime = format(scheduledDate, 'h:mm a');

        // Send meeting scheduled email
        try {
            await sendMeetingScheduledEmail(
                caseData.customerEmail,
                caseData.customerName,
                caseData.caseNumber,
                meetingDate,
                meetingTime,
                meetingLink
            );
            console.log(`[Consultations] Sent meeting scheduled email to ${caseData.customerEmail}`);
        } catch (emailError) {
            console.error('[Consultations] Failed to send meeting email:', emailError);
            // Continue even if email fails
        }

        return NextResponse.json({
            success: true,
            message: 'Meeting scheduled and notification sent',
        });
    } catch (error: any) {
        console.error('[Consultations] Error scheduling meeting:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to schedule meeting' },
            { status: 500 }
        );
    }
}
