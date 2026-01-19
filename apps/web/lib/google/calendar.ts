import { google, calendar_v3 } from 'googleapis';

// Google Calendar service for creating meetings with Google Meet links
// Requires GOOGLE_SERVICE_ACCOUNT_KEY environment variable

interface CreateMeetingParams {
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    attendees: { email: string; name?: string }[];
    caseNumber?: string;
}

interface MeetingResult {
    eventId: string;
    meetingLink: string;
    calendarLink: string;
    startDateTime: string;
    endDateTime: string;
}

/**
 * Get Google Calendar client using service account credentials
 */
function getCalendarClient(): calendar_v3.Calendar {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!serviceAccountKey) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    if (!calendarId) {
        throw new Error('GOOGLE_CALENDAR_ID environment variable is not set');
    }

    let credentials;
    try {
        credentials = JSON.parse(serviceAccountKey);
    } catch (e) {
        throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY - must be valid JSON');
    }

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    return google.calendar({ version: 'v3', auth });
}

/**
 * Create a Google Calendar event with automatic Google Meet link
 */
export async function createGoogleMeeting(params: CreateMeetingParams): Promise<MeetingResult> {
    const { title, description, date, startTime, endTime, caseNumber } = params;

    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID!;
    const useGoogleWorkspace = process.env.GOOGLE_WORKSPACE_ENABLED === 'true';

    // Construct ISO datetime strings (assuming IST timezone)
    const startDateTime = `${date}T${startTime}:00+05:30`;
    const endDateTime = `${date}T${endTime}:00+05:30`;

    const eventDescription = description ||
        `LawEthic Consultation${caseNumber ? ` - Case: ${caseNumber}` : ''}\n\nJoin the meeting using the Google Meet link provided.`;

    // Note: Personal Gmail accounts cannot create Google Meet links via API
    // This feature requires Google Workspace. For personal accounts, we create
    // the calendar event without Meet and use a static meeting link.
    const event: calendar_v3.Schema$Event = {
        summary: title,
        description: eventDescription,
        start: {
            dateTime: startDateTime,
            timeZone: 'Asia/Kolkata',
        },
        end: {
            dateTime: endDateTime,
            timeZone: 'Asia/Kolkata',
        },
        // Only add conferenceData if using Google Workspace
        ...(useGoogleWorkspace && {
            conferenceData: {
                createRequest: {
                    requestId: `lawethic-${caseNumber || Date.now()}`,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet',
                    },
                },
            },
        }),
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 }, // 1 day before
                { method: 'email', minutes: 60 }, // 1 hour before
                { method: 'popup', minutes: 15 }, // 15 minutes before
            ],
        },
    };

    try {
        const response = await calendar.events.insert({
            calendarId,
            requestBody: event,
            ...(useGoogleWorkspace && { conferenceDataVersion: 1 }),
            sendUpdates: 'none',
        });

        const createdEvent = response.data;

        // For personal Gmail, use static meeting link from env
        // For Workspace, use the generated hangoutLink
        let meetingLink = process.env.DEFAULT_MEETING_LINK || '';

        if (useGoogleWorkspace && createdEvent.hangoutLink) {
            meetingLink = createdEvent.hangoutLink;
        } else if (!meetingLink) {
            throw new Error('No meeting link configured. Set DEFAULT_MEETING_LINK in environment.');
        }

        return {
            eventId: createdEvent.id!,
            meetingLink,
            calendarLink: createdEvent.htmlLink!,
            startDateTime,
            endDateTime,
        };
    } catch (error: any) {
        console.error('[Google Calendar] Error creating event:', error);

        // Provide helpful error messages
        if (error.code === 403) {
            throw new Error('Google Calendar access denied. Make sure the service account has access to the calendar.');
        }
        if (error.code === 404) {
            throw new Error('Calendar not found. Check GOOGLE_CALENDAR_ID is correct.');
        }

        throw new Error(`Failed to create Google Calendar event: ${error.message}`);
    }
}

/**
 * Cancel a Google Calendar event
 */
export async function cancelGoogleMeeting(eventId: string): Promise<void> {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID!;

    try {
        await calendar.events.delete({
            calendarId,
            eventId,
            sendUpdates: 'none',
        });
    } catch (error: any) {
        console.error('[Google Calendar] Error cancelling event:', error);
        throw new Error(`Failed to cancel meeting: ${error.message}`);
    }
}

/**
 * Update a Google Calendar event (reschedule)
 */
export async function updateGoogleMeeting(
    eventId: string,
    params: Partial<CreateMeetingParams>
): Promise<MeetingResult> {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID!;

    const updates: calendar_v3.Schema$Event = {};

    if (params.title) {
        updates.summary = params.title;
    }

    if (params.description) {
        updates.description = params.description;
    }

    if (params.date && params.startTime) {
        updates.start = {
            dateTime: `${params.date}T${params.startTime}:00+05:30`,
            timeZone: 'Asia/Kolkata',
        };
    }

    if (params.date && params.endTime) {
        updates.end = {
            dateTime: `${params.date}T${params.endTime}:00+05:30`,
            timeZone: 'Asia/Kolkata',
        };
    }

    try {
        const response = await calendar.events.patch({
            calendarId,
            eventId,
            requestBody: updates,
            sendUpdates: 'none',
        });

        const updatedEvent = response.data;

        return {
            eventId: updatedEvent.id!,
            meetingLink: updatedEvent.hangoutLink || process.env.DEFAULT_MEETING_LINK || '',
            calendarLink: updatedEvent.htmlLink!,
            startDateTime: updatedEvent.start?.dateTime || '',
            endDateTime: updatedEvent.end?.dateTime || '',
        };
    } catch (error: any) {
        console.error('[Google Calendar] Error updating event:', error);
        throw new Error(`Failed to update meeting: ${error.message}`);
    }
}

/**
 * Check if Google Calendar is configured
 */
export function isGoogleCalendarConfigured(): boolean {
    return !!(process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GOOGLE_CALENDAR_ID);
}
