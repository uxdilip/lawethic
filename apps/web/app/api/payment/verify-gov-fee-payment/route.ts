import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'node-appwrite';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { sendEmail } from '@/lib/email/email-service';
import { generateGovFeeInvoice } from '@/lib/invoice/invoice-generator';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            feeRequestId
        } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !feeRequestId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { success: false, error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Get the fee request
        const feeRequest = await serverDatabases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.governmentFeeRequests,
            feeRequestId
        );

        if (!feeRequest) {
            return NextResponse.json(
                { success: false, error: 'Fee request not found' },
                { status: 404 }
            );
        }

        if (feeRequest.razorpayOrderId !== razorpay_order_id) {
            return NextResponse.json(
                { success: false, error: 'Order ID mismatch' },
                { status: 400 }
            );
        }

        // Create payment record
        const payment = await serverDatabases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.payments,
            ID.unique(),
            {
                orderId: feeRequest.orderId,
                amount: feeRequest.totalAmount,
                status: 'paid',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                method: 'razorpay',
            }
        );

        // Update fee request status
        await serverDatabases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.governmentFeeRequests,
            feeRequestId,
            {
                status: 'paid',
                paymentId: payment.$id,
                paidAt: new Date().toISOString(),
            }
        );

        // Create notification for operations team
        try {
            // Get order to find assigned operations user
            const order = await serverDatabases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                feeRequest.orderId
            );

            // Notification message
            const notifMessage = `Government fee of ₹${feeRequest.totalAmount.toLocaleString('en-IN')} paid for order ${order.orderNumber || feeRequest.orderId}. You can now proceed with the government filing.`;

            // If order is assigned, notify that user
            if (order.assignedTo) {
                await serverDatabases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.notifications,
                    ID.unique(),
                    {
                        userId: order.assignedTo,
                        orderId: feeRequest.orderId,
                        type: 'gov_fee_paid',
                        title: 'Government Fee Paid',
                        message: notifMessage,
                        description: 'You can now proceed with the government filing',
                        actionUrl: `/admin/cases/${feeRequest.orderId}`,
                        actionLabel: 'View Order',
                        read: false,
                        sourceUserId: feeRequest.customerId || null,
                    }
                );
                console.log('[GovFee] Notification created for assigned user:', order.assignedTo);
            }
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        // Add to order timeline
        try {
            await serverDatabases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orderTimeline,
                ID.unique(),
                {
                    orderId: feeRequest.orderId,
                    action: 'gov_fee_paid',
                    details: `Government fee of ₹${feeRequest.totalAmount.toLocaleString('en-IN')} paid successfully`,
                    performedBy: 'customer',
                    // Legacy fields for backward compatibility
                    status: 'gov_fee_paid',
                    note: `Government fee of ₹${feeRequest.totalAmount.toLocaleString('en-IN')} paid`,
                    updatedBy: 'customer',
                }
            );
            console.log('[GovFee] Timeline entry created for payment');
        } catch (timelineError: any) {
            console.error('Failed to add timeline entry:', timelineError?.message || timelineError);
        }

        // Generate invoice for the government fee payment
        let invoiceResult = null;
        try {
            console.log('[GovFee] Generating invoice for government fee payment...');
            invoiceResult = await generateGovFeeInvoice(
                feeRequestId,
                feeRequest.orderId,
                razorpay_payment_id
            );
            console.log('[GovFee] Invoice generated:', invoiceResult?.invoiceNumber);
        } catch (invoiceError: any) {
            console.error('[GovFee] Failed to generate invoice:', invoiceError?.message || invoiceError);
            // Non-critical, continue even if invoice generation fails
        }

        // Send confirmation email to customer
        try {
            // Get order details for customer info
            const order = await serverDatabases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                feeRequest.orderId
            );

            // Parse formData if it's a string
            const formData = typeof order.formData === 'string' ? JSON.parse(order.formData) : order.formData;

            const customerEmail = formData?.email || order.customerEmail;
            const customerName = formData?.fullName || formData?.businessName || 'Customer';
            const orderNumber = order.orderNumber || feeRequest.orderId;

            console.log('[GovFee] Preparing payment confirmation email:', { customerEmail, customerName, orderNumber });

            // Parse fee items
            const items = typeof feeRequest.items === 'string' ? JSON.parse(feeRequest.items) : feeRequest.items;

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
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .fee-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #059669; }
        .button { display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; }
        .total { font-weight: bold; font-size: 18px; }
        .success-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Payment Successful</h1>
        </div>
        <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Your government fee payment for order <strong>#${orderNumber}</strong> has been successfully received.</p>
            
            <div class="fee-box">
                <div style="text-align: center; margin-bottom: 15px;">
                    <span class="success-badge">Payment Confirmed</span>
                </div>
                <h3 style="margin-top: 0;">Payment Details</h3>
                <table>
                    ${feeBreakdownHtml}
                    <tr class="total">
                        <td style="padding: 10px;">Total Paid</td>
                        <td style="padding: 10px; text-align: right;">₹${feeRequest.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                </table>
                <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                    Payment ID: ${razorpay_payment_id}
                </p>
            </div>
            
            <p>Our team will now proceed with the government filing process. You will be notified once there are any updates on your application.</p>
            
            <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${feeRequest.orderId}" class="button">
                    View Order Details
                </a>
            </center>
            
            <p>Thank you for choosing LAWethic!</p>
            
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
                    subject: `Payment Confirmed - Government Fee for Order #${orderNumber}`,
                    html: emailHtml,
                });
                if (emailResult.success) {
                    console.log(`[GovFee] Payment confirmation email sent to ${customerEmail}`);
                } else {
                    console.error(`[GovFee] Payment confirmation email failed:`, emailResult.error);
                }
            } else {
                console.warn('[GovFee] No customer email found, skipping payment confirmation email');
            }
        } catch (emailError: any) {
            console.error('Failed to send payment confirmation email:', emailError?.message || emailError);
        }

        return NextResponse.json({
            success: true,
            message: 'Government fee payment verified successfully',
            paymentId: payment.$id,
            invoiceNumber: invoiceResult?.invoiceNumber || null,
            invoiceFileId: invoiceResult?.fileId || null,
        });
    } catch (error: any) {
        console.error('Failed to verify government fee payment:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Payment verification failed' },
            { status: 500 }
        );
    }
}
