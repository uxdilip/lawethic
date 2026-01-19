import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID, Query } from 'node-appwrite';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { format, parse } from 'date-fns';
import { sendMeetingScheduledEmail } from '@/lib/email/email-service';
import { createGoogleMeeting, isGoogleCalendarConfigured } from '@/lib/google/calendar';

const DATABASE_ID = appwriteConfig.databaseId;

// Fallback meeting link if Google Calendar is not configured
const DEFAULT_MEETING_LINK = process.env.DEFAULT_MEETING_LINK || '';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { caseId, date, startTime, endTime } = body;

        console.log('[Booking] Request received:', { caseId, date, startTime, endTime });

        if (!caseId || !date || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Missing required fields: caseId, date, startTime, endTime' },
                { status: 400 }
            );
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

        // Get the case details
        const caseData = await databases.getDocument(
            DATABASE_ID,
            appwriteConfig.collections.consultationCases,
            caseId
        );

        if (!caseData) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 });
        }

        // Check if case already has a booking
        if (caseData.status === 'meeting_scheduled') {
            return NextResponse.json({ error: 'This case already has a scheduled meeting' }, { status: 400 });
        }

        // Get expert ID from availability (first available expert for MVP)
        const availabilityRes = await databases.listDocuments(
            DATABASE_ID,
            appwriteConfig.collections.expertAvailability,
            [Query.limit(1)]
        );

        if (availabilityRes.documents.length === 0) {
            return NextResponse.json({ error: 'No expert availability configured' }, { status: 400 });
        }

        const expertId = availabilityRes.documents[0].expertId;

        // Check if slot is still available (double-booking prevention)
        const existingBookings = await databases.listDocuments(
            DATABASE_ID,
            appwriteConfig.collections.consultationBookings,
            [
                Query.equal('expertId', expertId),
                Query.equal('date', date),
                Query.equal('startTime', startTime),
                Query.notEqual('status', 'cancelled'),
            ]
        );

        if (existingBookings.documents.length > 0) {
            return NextResponse.json({ error: 'This slot is no longer available' }, { status: 400 });
        }

        // Create meeting link - prefer Google Calendar, fallback to static link
        let meetingLink = DEFAULT_MEETING_LINK;

        if (isGoogleCalendarConfigured()) {
            try {
                console.log('[Booking] Creating Google Calendar event with Meet link...');

                const meetingResult = await createGoogleMeeting({
                    title: `LawEthic Consultation - ${caseData.caseNumber}`,
                    description: `Legal consultation for case ${caseData.caseNumber}\n\nCustomer: ${caseData.customerName}\nTopic: ${caseData.subject || 'General consultation'}`,
                    date,
                    startTime,
                    endTime,
                    attendees: [
                        { email: caseData.customerEmail, name: caseData.customerName },
                    ],
                    caseNumber: caseData.caseNumber,
                });

                meetingLink = meetingResult.meetingLink;

                console.log(`[Booking] Created Google Meet link: ${meetingLink}`);
            } catch (calendarError: any) {
                console.error('[Booking] Failed to create Google Calendar event:', calendarError.message);
                console.error('[Booking] Full error:', JSON.stringify(calendarError, null, 2));

                // If Google Calendar fails and no fallback link, return error
                if (!DEFAULT_MEETING_LINK) {
                    return NextResponse.json(
                        { error: `Failed to create meeting: ${calendarError.message}` },
                        { status: 500 }
                    );
                }

                // Use fallback link
                console.log('[Booking] Using fallback meeting link');
                meetingLink = DEFAULT_MEETING_LINK;
            }
        } else {
            console.log('[Booking] Google Calendar not configured, using default link');

            if (!DEFAULT_MEETING_LINK) {
                return NextResponse.json(
                    { error: 'Meeting service not configured. Please contact support.' },
                    { status: 500 }
                );
            }
        }

        // Create booking record
        const booking = await databases.createDocument(
            DATABASE_ID,
            appwriteConfig.collections.consultationBookings,
            ID.unique(),
            {
                caseId,
                customerId: caseData.customerId,
                expertId,
                date,
                startTime,
                endTime,
                meetingLink,
                status: 'scheduled',
            }
        );

        // Format datetime for case update
        const scheduledAt = `${date}T${startTime}:00`;

        // Update case with booking details
        await databases.updateDocument(
            DATABASE_ID,
            appwriteConfig.collections.consultationCases,
            caseId,
            {
                status: 'meeting_scheduled',
                scheduledAt,
                meetingLink,
                assignedExpertId: expertId,
            }
        );

        // Send confirmation email to customer
        try {
            const meetingDate = format(new Date(date), 'EEEE, MMMM d, yyyy');
            const meetingTime = format(new Date(`${date}T${startTime}`), 'h:mm a');

            await sendMeetingScheduledEmail(
                caseData.customerEmail,
                caseData.customerName,
                caseData.caseNumber,
                meetingDate,
                meetingTime,
                meetingLink
            );
            console.log(`[Booking] Sent confirmation email to ${caseData.customerEmail}`);
        } catch (emailError) {
            console.error('[Booking] Failed to send email:', emailError);
            // Don't fail the booking if email fails
        }

        return NextResponse.json({
            success: true,
            booking: {
                id: booking.$id,
                date,
                startTime,
                endTime,
                meetingLink,
            },
            message: 'Booking confirmed successfully',
        });
    } catch (error: any) {
        console.error('[Booking] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to book slot' }, { status: 500 });
    }
}
