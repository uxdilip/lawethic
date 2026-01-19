import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query, Users, Client } from 'node-appwrite';
import { sendEmail, sendMeetingReminderEmail } from '@/lib/email/email-service';

// This route should be called by a cron job every 5-10 minutes
// It sends reminders for meetings happening in the next 30 minutes

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret (optional but recommended for production)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
        const fortyMinutesFromNow = new Date(now.getTime() + 40 * 60 * 1000);

        // Get all scheduled meetings happening in the 30-40 minute window
        const cases = await serverDatabases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.consultationCases,
            [
                Query.equal('status', 'meeting_scheduled'),
                Query.isNotNull('scheduledAt'),
                Query.greaterThanEqual('scheduledAt', thirtyMinutesFromNow.toISOString()),
                Query.lessThanEqual('scheduledAt', fortyMinutesFromNow.toISOString()),
            ]
        );

        const results = {
            processed: 0,
            customerReminders: 0,
            expertReminders: 0,
            errors: [] as string[],
        };

        // Get expert emails for notifications
        let expertEmails: Record<string, string> = {};
        try {
            const apiKey = process.env.APPWRITE_API_KEY;
            if (apiKey) {
                const client = new Client()
                    .setEndpoint(appwriteConfig.endpoint)
                    .setProject(appwriteConfig.project)
                    .setKey(apiKey);
                const users = new Users(client);
                const allUsers = await users.list([Query.limit(100)]);
                allUsers.users
                    .filter(u => u.prefs?.role === 'expert' && u.email)
                    .forEach(u => { expertEmails[u.$id] = u.email; });
            }
        } catch (e) {
            console.error('[Reminders] Failed to fetch expert emails:', e);
        }

        for (const caseDoc of cases.documents) {
            try {
                // Check if reminder already sent (check metadata or a flag)
                if (caseDoc.reminder30mSent) {
                    continue;
                }

                const scheduledAt = new Date(caseDoc.scheduledAt);

                const dateStr = scheduledAt.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                });

                const timeStr = scheduledAt.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                });

                // Send reminder to customer
                if (caseDoc.customerEmail && caseDoc.meetingLink) {
                    await sendMeetingReminderEmail(
                        caseDoc.customerEmail,
                        caseDoc.customerName?.split(' ')[0] || 'there',
                        caseDoc.caseNumber,
                        dateStr,
                        timeStr,
                        caseDoc.meetingLink,
                        'customer'
                    );
                    results.customerReminders++;
                }

                // Send reminder to all experts (since all experts see all consultations)
                for (const [expertId, expertEmail] of Object.entries(expertEmails)) {
                    if (expertEmail && caseDoc.meetingLink) {
                        await sendMeetingReminderEmail(
                            expertEmail,
                            'Expert',
                            caseDoc.caseNumber,
                            dateStr,
                            timeStr,
                            caseDoc.meetingLink,
                            'expert'
                        );
                        results.expertReminders++;
                    }
                }

                // Mark reminder as sent (update document)
                try {
                    await serverDatabases.updateDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.collections.consultationCases,
                        caseDoc.$id,
                        { reminder30mSent: true }
                    );
                } catch (updateError) {
                    console.error('[Reminders] Failed to mark reminder as sent:', updateError);
                }

                results.processed++;
            } catch (error: any) {
                results.errors.push(`Case ${caseDoc.$id}: ${error.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            ...results,
            totalCases: cases.total,
        });

    } catch (error: any) {
        console.error('Error processing reminders:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process reminders' },
            { status: 500 }
        );
    }
}

async function sendReminderEmail(caseDoc: any, type: '24h' | '1h') {
    const customerName = caseDoc.customerName?.split(' ')[0] || 'there';
    const scheduledAt = new Date(caseDoc.scheduledAt);

    const dateStr = scheduledAt.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const timeStr = scheduledAt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    const subject = type === '24h'
        ? 'Reminder: Your Expert Consultation is Tomorrow'
        : 'Starting Soon: Your Expert Consultation in 1 Hour';

    const urgencyMessage = type === '24h'
        ? 'Your free expert consultation is scheduled for tomorrow.'
        : 'Your free expert consultation starts in about 1 hour!';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meeting Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1A2A44; padding: 32px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">LawEthic</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <span style="font-size: 48px;">${type === '24h' ? '📅' : '⏰'}</span>
                            </div>
                            
                            <h2 style="margin: 0 0 16px 0; color: #1A2A44; font-size: 22px; font-weight: 600; text-align: center;">
                                Hi ${customerName}!
                            </h2>
                            
                            <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                                ${urgencyMessage}
                            </p>
                            
                            <!-- Meeting Details Card -->
                            <div style="background-color: #f0f9ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
                                <h3 style="margin: 0 0 16px 0; color: #1A2A44; font-size: 16px; font-weight: 600;">Meeting Details</h3>
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #6b7280; font-size: 14px;">📅 Date:</span>
                                            <span style="color: #1A2A44; font-size: 14px; font-weight: 500; margin-left: 8px;">${dateStr}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #6b7280; font-size: 14px;">🕐 Time:</span>
                                            <span style="color: #1A2A44; font-size: 14px; font-weight: 500; margin-left: 8px;">${timeStr}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #6b7280; font-size: 14px;">⏱️ Duration:</span>
                                            <span style="color: #1A2A44; font-size: 14px; font-weight: 500; margin-left: 8px;">30 minutes</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #6b7280; font-size: 14px;">📋 Case:</span>
                                            <span style="color: #1A2A44; font-size: 14px; font-weight: 500; margin-left: 8px;">${caseDoc.caseNumber}</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            ${caseDoc.meetingLink ? `
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${caseDoc.meetingLink}" 
                                   style="display: inline-block; background-color: #1A2A44; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                    Join Meeting
                                </a>
                            </div>
                            ` : ''}
                            
                            <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
                                <p style="margin: 0; color: #92400e; font-size: 14px;">
                                    <strong>💡 Tips for your consultation:</strong><br>
                                    • Join 2-3 minutes early<br>
                                    • Keep relevant documents handy<br>
                                    • Prepare your questions in advance
                                </p>
                            </div>
                            
                            <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; text-align: center;">
                                Need to reschedule? <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://lawethic.in'}/dashboard/consultations/${caseDoc.$id}" style="color: #1A2A44;">View your booking</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                                LawEthic - Your Trusted Legal Partner
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © ${new Date().getFullYear()} LawEthic. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    await sendEmail({
        to: caseDoc.customerEmail,
        subject,
        html: emailHtml,
    });
}
