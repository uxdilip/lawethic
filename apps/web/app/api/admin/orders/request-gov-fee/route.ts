import { NextRequest, NextResponse } from 'next/server';
import { ID, Query } from 'node-appwrite';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { sendEmail } from '@/lib/email/email-service';

// Predefined government fees by service (not exported - Next.js route files only allow handler exports)
const GOVERNMENT_FEES: Record<string, { label: string; items: { label: string; amount: number }[] }> = {
    'trademark-registration': {
        label: 'Trademark Registration',
        items: [
            { label: 'Trademark Filing Fee (Individual/Startup)', amount: 4500 },
        ]
    },
    'fssai-registration': {
        label: 'FSSAI License',
        items: [
            { label: 'FSSAI Basic Registration', amount: 100 },
        ]
    },
    'fssai-state-license': {
        label: 'FSSAI State License',
        items: [
            { label: 'FSSAI State License Fee', amount: 2000 },
        ]
    },
    'fssai-central-license': {
        label: 'FSSAI Central License',
        items: [
            { label: 'FSSAI Central License Fee', amount: 7500 },
        ]
    },
    'trade-license': {
        label: 'Trade License',
        items: [
            { label: 'Municipal Trade License Fee', amount: 2500 },
        ]
    },
    'iec-registration': {
        label: 'Import Export Code',
        items: [
            { label: 'IEC Registration Fee', amount: 500 },
        ]
    },
    'udyam-registration': {
        label: 'Udyam Registration',
        items: [
            { label: 'Government Fee', amount: 0 },
        ]
    },
    'msme-registration': {
        label: 'MSME Registration',
        items: [
            { label: 'Government Fee', amount: 0 },
        ]
    },
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, customerId, serviceId, items, note, requestedBy } = body;

        if (!orderId || !customerId || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Calculate total
        const totalAmount = items.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);

        if (totalAmount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Total amount must be greater than 0' },
                { status: 400 }
            );
        }

        // Create government fee request
        const feeRequest = await serverDatabases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.governmentFeeRequests,
            ID.unique(),
            {
                orderId,
                customerId,
                serviceId: serviceId || null,
                items: JSON.stringify(items),
                totalAmount,
                note: note || null,
                status: 'pending',
                requestedBy: requestedBy || 'operations',
                razorpayOrderId: null,
                paymentId: null,
                paidAt: null,
            }
        );

        // Create notification for customer
        try {
            await serverDatabases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.notifications,
                ID.unique(),
                {
                    userId: customerId,
                    orderId,
                    type: 'gov_fee_requested',
                    title: 'Government Fee Required',
                    message: `Government fee of ₹${totalAmount.toLocaleString('en-IN')} is required for your order`,
                    description: note || 'Please pay the government fee to proceed with filing',
                    actionUrl: `/orders/${orderId}`,
                    actionLabel: 'Pay Now',
                    read: false,
                    sourceUserId: requestedBy || null,
                }
            );
            console.log('[GovFee] Notification created for customer:', customerId);
        } catch (notifError: any) {
            console.error('Failed to create notification:', notifError?.message || notifError);
        }

        // Add to order timeline
        try {
            await serverDatabases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orderTimeline,
                ID.unique(),
                {
                    orderId,
                    action: 'gov_fee_requested',
                    details: `Government fee of ₹${totalAmount.toLocaleString('en-IN')} requested${note ? `. Note: ${note}` : ''}`,
                    performedBy: requestedBy || 'operations',
                    // Legacy fields for backward compatibility
                    status: 'gov_fee_requested',
                    note: `Government fee of ₹${totalAmount.toLocaleString('en-IN')} requested`,
                    updatedBy: requestedBy || 'operations',
                }
            );
            console.log('[GovFee] Timeline entry created for fee request');
        } catch (timelineError: any) {
            console.error('Failed to add timeline entry:', timelineError?.message || timelineError);
        }

        // Send email to customer
        try {
            // Get order details for customer info
            const order = await serverDatabases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                orderId
            );

            // Parse formData if it's a string
            const formData = typeof order.formData === 'string' ? JSON.parse(order.formData) : order.formData;

            const customerEmail = formData?.email || order.customerEmail;
            const customerName = formData?.fullName || formData?.businessName || 'Customer';
            const orderNumber = order.orderNumber || orderId;

            console.log('[GovFee] Preparing email for customer:', { customerEmail, customerName, orderNumber });

            if (customerEmail) {
                // Build fee breakdown HTML
                const feeBreakdownHtml = items.map((item: any) => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.amount.toLocaleString('en-IN')}</td>
                    </tr>
                `).join('');

                const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .fee-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
        .button { display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; }
        .total { font-weight: bold; font-size: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Government Fee Required</h1>
        </div>
        <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>A government fee payment is required to proceed with your order <strong>#${orderNumber}</strong>.</p>
            
            <div class="fee-box">
                <h3 style="margin-top: 0;">Fee Breakdown</h3>
                <table>
                    ${feeBreakdownHtml}
                    <tr class="total">
                        <td style="padding: 10px;">Total Amount</td>
                        <td style="padding: 10px; text-align: right;">₹${totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                </table>
                ${note ? `<p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-style: italic;">${note}</p>` : ''}
            </div>
            
            <p>Please complete this payment at your earliest convenience to avoid any delays in processing your application.</p>
            
            <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" class="button">
                    Pay Now
                </a>
            </center>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            <strong>LAWethic Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} LAWethic. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
                `.trim();

                const emailResult = await sendEmail({
                    to: customerEmail,
                    subject: `Government Fee Required - Order #${orderNumber}`,
                    html: emailHtml,
                });
                if (emailResult.success) {
                    console.log(`[GovFee] Email sent successfully to ${customerEmail}`);
                } else {
                    console.error(`[GovFee] Email failed:`, emailResult.error);
                }
            } else {
                console.warn('[GovFee] No customer email found, skipping email notification');
            }
        } catch (emailError: any) {
            console.error('Failed to send government fee email:', emailError?.message || emailError);
        }

        return NextResponse.json({
            success: true,
            feeRequest: {
                ...feeRequest,
                items: JSON.parse(feeRequest.items),
            },
        });
    } catch (error: any) {
        console.error('Failed to create government fee request:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create request' },
            { status: 500 }
        );
    }
}

// GET - Fetch government fee requests for an order
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json(
                { success: false, error: 'Order ID is required' },
                { status: 400 }
            );
        }

        const response = await serverDatabases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.governmentFeeRequests,
            [
                Query.equal('orderId', orderId),
                Query.orderDesc('$createdAt'),
            ]
        );

        // Parse items JSON for each request
        const feeRequests = response.documents.map((doc: any) => ({
            ...doc,
            items: typeof doc.items === 'string' ? JSON.parse(doc.items) : doc.items,
        }));

        return NextResponse.json({
            success: true,
            feeRequests,
            predefinedFees: GOVERNMENT_FEES,
        });
    } catch (error: any) {
        console.error('Failed to fetch government fee requests:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch requests' },
            { status: 500 }
        );
    }
}
