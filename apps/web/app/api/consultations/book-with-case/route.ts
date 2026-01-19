import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID, Query, Users } from 'node-appwrite';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { format } from 'date-fns';
import {
    ConsultationStatus,
    BusinessType,
    CaseType,
    CASE_TYPE_SUGGESTIONS,
    CASE_TYPE_LABELS,
    BUSINESS_TYPE_LABELS,
} from '@lawethic/appwrite/types';
import {
    sendConsultationConfirmationEmail,
    sendNewConsultationAdminAlert,
    sendNewConsultationExpertAlert,
    sendMeetingScheduledEmail,
} from '@/lib/email/email-service';
import { createGoogleMeeting, isGoogleCalendarConfigured } from '@/lib/google/calendar';

const DATABASE_ID = appwriteConfig.databaseId;
const COLLECTION_ID = appwriteConfig.collections.consultationCases;
const DEFAULT_MEETING_LINK = process.env.DEFAULT_MEETING_LINK || '';

// Generate case number: CASE-2026-0001
async function generateCaseNumber(databases: Databases): Promise<string> {
    const year = new Date().getFullYear();

    try {
        const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.startsWith('caseNumber', `CASE-${year}`),
            Query.orderDesc('caseNumber'),
            Query.limit(1),
        ]);

        if (existing.documents.length > 0) {
            const lastNumber = existing.documents[0].caseNumber;
            const sequence = parseInt(lastNumber.split('-')[2], 10) + 1;
            return `CASE-${year}-${sequence.toString().padStart(4, '0')}`;
        }
    } catch (error) {
        console.log('No existing cases found, starting from 0001');
    }

    return `CASE-${year}-0001`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            // Case data
            businessType,
            caseType,
            title,
            description,
            attachments = [],
            customerName,
            customerEmail,
            customerPhone,
            // Booking data
            date,
            startTime,
            endTime,
        } = body;

        console.log('[BookWithCase] Request received:', { customerEmail, date, startTime });

        // Validation - Case data
        if (!title || !description) {
            return NextResponse.json(
                { error: 'Missing required fields: title, description' },
                { status: 400 }
            );
        }

        if (!customerName || !customerEmail || !customerPhone) {
            return NextResponse.json(
                { error: 'Missing required contact fields' },
                { status: 400 }
            );
        }

        // Validation - Booking data
        if (!date || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Missing required booking fields: date, startTime, endTime' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Validate phone format (10 digits)
        const phoneRegex = /^\d{10}$/;
        const cleanPhone = customerPhone.replace(/\D/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            return NextResponse.json({ error: 'Phone number must be 10 digits' }, { status: 400 });
        }

        // Get user ID from session if logged in
        let customerId = 'guest';
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
            const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
                const [name, value] = cookie.trim().split('=');
                acc[name] = value;
                return acc;
            }, {} as Record<string, string>);

            const sessionCookieName = Object.keys(cookies).find(
                (name) => name.startsWith('a_session_') || name === 'appwrite-session'
            );

            if (sessionCookieName) {
                try {
                    const userClient = new Client()
                        .setEndpoint(appwriteConfig.endpoint)
                        .setProject(appwriteConfig.project)
                        .setSession(cookies[sessionCookieName]);

                    const { Account } = await import('node-appwrite');
                    const account = new Account(userClient);
                    const user = await account.get();
                    customerId = user.$id;
                } catch (error) {
                    console.log('Could not get user from session, treating as guest');
                }
            }
        }

        // Initialize admin client
        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const adminClient = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.project)
            .setKey(apiKey);

        const databases = new Databases(adminClient);

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

        // Generate case number
        const caseNumber = await generateCaseNumber(databases);

        // Get auto-suggested services based on case type
        const suggestedServiceSlugs = caseType ? (CASE_TYPE_SUGGESTIONS[caseType as CaseType] || []) : [];

        // Create meeting link - prefer Google Calendar, fallback to static link
        let meetingLink = DEFAULT_MEETING_LINK;

        if (isGoogleCalendarConfigured()) {
            try {
                console.log('[BookWithCase] Creating Google Calendar event...');

                const meetingResult = await createGoogleMeeting({
                    title: `LawEthic Consultation - ${caseNumber}`,
                    description: `Legal consultation for case ${caseNumber}\n\nCustomer: ${customerName}\nTopic: ${title}`,
                    date,
                    startTime,
                    endTime,
                    attendees: [{ email: customerEmail, name: customerName }],
                    caseNumber,
                });

                meetingLink = meetingResult.meetingLink;
                console.log(`[BookWithCase] Created Google Meet link: ${meetingLink}`);
            } catch (calendarError: any) {
                console.error('[BookWithCase] Failed to create Google Calendar event:', calendarError.message);
                if (!DEFAULT_MEETING_LINK) {
                    return NextResponse.json(
                        { error: `Failed to create meeting: ${calendarError.message}` },
                        { status: 500 }
                    );
                }
                meetingLink = DEFAULT_MEETING_LINK;
            }
        } else {
            console.log('[BookWithCase] Google Calendar not configured, using default link');
            if (!DEFAULT_MEETING_LINK) {
                return NextResponse.json(
                    { error: 'Meeting service not configured. Please contact support.' },
                    { status: 500 }
                );
            }
        }

        // Format datetime for case
        const scheduledAt = `${date}T${startTime}:00`;

        // Create case document with booking info already populated
        const caseData = {
            caseNumber,
            customerId,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim().toLowerCase(),
            customerPhone: cleanPhone,
            businessType: (businessType as BusinessType) || 'startup',
            caseType: (caseType as CaseType) || 'general-query',
            title: title.trim(),
            description: description.trim(),
            attachments: attachments || [],
            status: 'meeting_scheduled' as ConsultationStatus,
            scheduledAt,
            meetingLink,
            assignedExpertId: expertId,
            suggestedServiceSlugs,
            convertedOrderIds: [],
            amount: 0,
            paymentStatus: 'free',
            reminder30mSent: false,
        };

        const caseDocument = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            caseData
        );

        console.log(`[BookWithCase] Created case ${caseNumber} for ${customerEmail}`);

        // Create booking record
        const booking = await databases.createDocument(
            DATABASE_ID,
            appwriteConfig.collections.consultationBookings,
            ID.unique(),
            {
                caseId: caseDocument.$id,
                customerId,
                expertId,
                date,
                startTime,
                endTime,
                meetingLink,
                status: 'scheduled',
            }
        );

        console.log(`[BookWithCase] Created booking ${booking.$id}`);

        // Send all emails now that booking is complete
        const caseTypeLabel = caseType ? (CASE_TYPE_LABELS[caseType as CaseType] || caseType) : 'General Consultation';
        const businessTypeLabel = businessType ? (BUSINESS_TYPE_LABELS[businessType as BusinessType] || businessType) : 'General';
        const meetingDate = format(new Date(date), 'EEEE, MMMM d, yyyy');
        const meetingTime = format(new Date(`${date}T${startTime}`), 'h:mm a');

        // 1. Send meeting confirmation email to customer (with slot details)
        try {
            await sendMeetingScheduledEmail(
                customerEmail,
                customerName,
                caseNumber,
                meetingDate,
                meetingTime,
                meetingLink
            );
            console.log(`[BookWithCase] Sent meeting confirmation to ${customerEmail}`);
        } catch (emailError) {
            console.error('[BookWithCase] Failed to send meeting confirmation:', emailError);
        }

        // 2. Send notification to admin
        try {
            await sendNewConsultationAdminAlert(
                caseNumber,
                customerName,
                customerEmail,
                cleanPhone,
                title,
                caseTypeLabel,
                businessTypeLabel,
                meetingDate,
                meetingTime
            );
            console.log('[BookWithCase] Sent admin notification');
        } catch (emailError) {
            console.error('[BookWithCase] Failed to send admin notification:', emailError);
        }

        // 3. Send notification to all experts
        try {
            const users = new Users(adminClient);
            const allUsers = await users.list([Query.limit(100)]);

            const expertEmails = allUsers.users
                .filter(u => u.prefs?.role === 'expert' && u.email)
                .map(u => u.email);

            if (expertEmails.length > 0) {
                await sendNewConsultationExpertAlert(
                    expertEmails,
                    caseNumber,
                    customerName,
                    title,
                    caseTypeLabel,
                    businessTypeLabel,
                    meetingDate,
                    meetingTime,
                    meetingLink
                );
                console.log(`[BookWithCase] Sent notification to ${expertEmails.length} experts`);
            }
        } catch (emailError) {
            console.error('[BookWithCase] Failed to send expert notifications:', emailError);
        }

        return NextResponse.json({
            success: true,
            caseId: caseDocument.$id,
            caseNumber: caseDocument.caseNumber,
            booking: {
                id: booking.$id,
                date,
                startTime,
                endTime,
                meetingLink,
            },
            message: 'Consultation booked successfully',
        });
    } catch (error: any) {
        console.error('[BookWithCase] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to book consultation' },
            { status: 500 }
        );
    }
}
