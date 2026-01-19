import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { sendEmail } from '@/lib/email/email-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { caseId, recommendations, suggestedServiceSlugs } = body;

        if (!caseId) {
            return NextResponse.json(
                { error: 'Case ID is required' },
                { status: 400 }
            );
        }

        // Get the case
        const caseDoc = await serverDatabases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.consultationCases,
            caseId
        );

        if (!caseDoc) {
            return NextResponse.json(
                { error: 'Case not found' },
                { status: 404 }
            );
        }

        // Update the case with recommendations
        const updatedCase = await serverDatabases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.consultationCases,
            caseId,
            {
                recommendations: recommendations || '',
                suggestedServiceSlugs: suggestedServiceSlugs || [],
                status: 'recommendations_sent'
            }
        );

        // Get service names for the email
        let serviceNames: string[] = [];
        if (suggestedServiceSlugs && suggestedServiceSlugs.length > 0) {
            // Get service names from static data
            const { getAllServices } = await import('@/data/services');
            const allServices = getAllServices();
            serviceNames = suggestedServiceSlugs
                .map((slug: string) => {
                    const service = allServices.find(s => s.slug === slug);
                    return service ? service.title : slug;
                })
                .filter(Boolean);
        }

        // Send email notification to customer
        const customerEmail = caseDoc.customerEmail;
        const customerName = caseDoc.customerName?.split(' ')[0] || 'there';

        if (customerEmail) {
            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Expert Recommendations</title>
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
                            <h2 style="margin: 0 0 16px 0; color: #1A2A44; font-size: 22px; font-weight: 600;">
                                Hi ${customerName}! 👋
                            </h2>
                            
                            <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Thank you for your recent consultation with our expert. Based on our discussion, we've prepared personalized recommendations for you.
                            </p>
                            
                            ${recommendations ? `
                            <div style="background-color: #f8fafc; border-left: 4px solid #1A2A44; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                                <h3 style="margin: 0 0 12px 0; color: #1A2A44; font-size: 16px; font-weight: 600;">Expert Recommendations</h3>
                                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${recommendations}</p>
                            </div>
                            ` : ''}
                            
                            ${serviceNames.length > 0 ? `
                            <div style="margin: 24px 0;">
                                <h3 style="margin: 0 0 16px 0; color: #1A2A44; font-size: 16px; font-weight: 600;">Recommended Services</h3>
                                <ul style="margin: 0; padding: 0; list-style: none;">
                                    ${serviceNames.map(name => `
                                    <li style="margin: 8px 0; padding: 12px 16px; background-color: #f0fdf4; border-radius: 8px; color: #15803d; font-size: 14px;">
                                        ✓ ${name}
                                    </li>
                                    `).join('')}
                                </ul>
                            </div>
                            ` : ''}
                            
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://lawethic.in'}/dashboard/consultations/${caseId}" 
                                   style="display: inline-block; background-color: #1A2A44; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                    View Full Recommendations
                                </a>
                            </div>
                            
                            <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                If you have any questions or need further assistance, feel free to reach out to us.
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
                to: customerEmail,
                subject: 'Your Expert Recommendations from LawEthic',
                html: emailHtml
            });
        }

        return NextResponse.json({
            success: true,
            case: updatedCase
        });

    } catch (error) {
        console.error('Error sending recommendations:', error);
        return NextResponse.json(
            { error: 'Failed to send recommendations' },
            { status: 500 }
        );
    }
}
