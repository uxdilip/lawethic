import { Resend } from 'resend';

let resend: Resend | null = null;

function getResendClient() {
    if (!resend) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: {
        filename: string;
        content: Buffer | string;
    }[];
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: EmailOptions) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('[Email] RESEND_API_KEY not configured, skipping email');
            return { success: false, error: 'Email service not configured' };
        }

        const client = getResendClient();

        // Control whether to send to real users or test email
        // Set EMAIL_SEND_TO_REAL_USERS=true in .env.local to send to actual users
        // When domain is verified in Resend, you can enable this
        const sendToRealUsers = process.env.EMAIL_SEND_TO_REAL_USERS === 'true';
        const originalRecipients = Array.isArray(options.to) ? options.to : [options.to];
        const testEmail = process.env.RESEND_TEST_EMAIL || 'dk81520826@gmail.com';

        // Log email routing for debugging
        if (!sendToRealUsers) {
            console.log(`[Email] Test mode: Redirecting email from ${originalRecipients.join(', ')} to ${testEmail}`);
        }

        const emailData: any = {
            from: process.env.EMAIL_FROM || 'LAWethic <noreply@lawethic.com>',
            to: sendToRealUsers ? originalRecipients : [testEmail],
            subject: options.subject,
        };

        if (options.html) emailData.html = options.html;
        if (options.text) emailData.text = options.text;
        if (options.attachments) emailData.attachments = options.attachments;

        const result = await client.emails.send(emailData);

        if (result.error) {
            console.error('[Email] Resend API error:', result.error);
            return { success: false, error: result.error };
        }

        return { success: true, id: result.data?.id };
    } catch (error: any) {
        console.error('[Email] Failed to send:', {
            message: error.message,
            stack: error.stack,
            fullError: error
        });
        return { success: false, error: error.message };
    }
}

/**
 * Send invoice email with PDF attachment
 */
export async function sendInvoiceEmail(
    customerEmail: string,
    customerName: string,
    invoiceNumber: string,
    orderNumber: string,
    serviceName: string,
    amount: number,
    pdfBuffer: Buffer
) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .invoice-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #1e40af; }
        .button { display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Invoice Generated</h1>
        </div>
        <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Thank you for your payment! Your invoice has been generated and is attached to this email.</p>
            
            <div class="invoice-info">
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Amount Paid:</strong> ₹${amount.toLocaleString('en-IN')}</p>
            </div>
            
            <p>You can also download your invoice anytime from your order details page:</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}" class="button">
                View Order Details
            </a>
            
            <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
            
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

    const text = `
Dear ${customerName},

Thank you for your payment! Your invoice has been generated and is attached to this email.

Invoice Details:
- Invoice Number: ${invoiceNumber}
- Order Number: ${orderNumber}
- Service: ${serviceName}
- Amount Paid: ₹${amount.toLocaleString('en-IN')}

You can also download your invoice anytime from: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
LAWethic Team
    `.trim();

    return sendEmail({
        to: customerEmail,
        subject: `Invoice ${invoiceNumber} - Payment Confirmation`,
        html,
        text,
        attachments: [
            {
                filename: `${invoiceNumber}.pdf`,
                content: pdfBuffer,
            },
        ],
    });
}

/**
 * Send payment confirmation email (without invoice)
 */
export async function sendPaymentConfirmationEmail(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    serviceName: string,
    amount: number,
    paymentId: string
) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .payment-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #059669; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Payment Successful</h1>
        </div>
        <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>We have successfully received your payment. Thank you for choosing LAWethic!</p>
            
            <div class="payment-info">
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Amount Paid:</strong> ₹${amount.toLocaleString('en-IN')}</p>
                <p><strong>Payment ID:</strong> ${paymentId}</p>
            </div>
            
            <p>Your invoice will be generated shortly and sent to you in a separate email.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}" class="button">
                View Order Details
            </a>
            
            <p>We will keep you updated on the progress of your order.</p>
            
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

    return sendEmail({
        to: customerEmail,
        subject: `Payment Successful - Order ${orderNumber}`,
        html,
    });
}

/**
 * Send order status update email
 */
export async function sendOrderStatusEmail(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    serviceName: string,
    newStatus: string,
    message?: string
) {
    const statusColors: Record<string, string> = {
        pending: '#f59e0b',
        in_progress: '#3b82f6',
        completed: '#059669',
        cancelled: '#ef4444',
    };

    const statusLabels: Record<string, string> = {
        pending: 'Pending',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };

    const color = statusColors[newStatus] || '#6b7280';
    const statusLabel = statusLabels[newStatus] || newStatus;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${color}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .status-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid ${color}; }
        .button { display: inline-block; background: ${color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Status Updated</h1>
        </div>
        <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Your order status has been updated.</p>
            
            <div class="status-info">
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>New Status:</strong> <span style="color: ${color}; font-weight: bold;">${statusLabel}</span></p>
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}" class="button">
                View Order Details
            </a>
            
            <p>If you have any questions, please feel free to contact us.</p>
            
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

    return sendEmail({
        to: customerEmail,
        subject: `Order ${orderNumber} - Status Updated to ${statusLabel}`,
        html,
    });
}

/**
 * Send document uploaded notification
 */
export async function sendDocumentUploadedEmail(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    documentName: string
) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .doc-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #8b5cf6; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Document Available</h1>
        </div>
        <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>A new document has been uploaded to your order.</p>
            
            <div class="doc-info">
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Document:</strong> ${documentName}</p>
            </div>
            
            <p>You can view and download this document from your order details page.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}" class="button">
                View Document
            </a>
            
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

    return sendEmail({
        to: customerEmail,
        subject: `New Document Available - Order ${orderNumber}`,
        html,
    });
}

/**
 * Send certificate ready notification
 */
export async function sendCertificateReadyEmail(
    customerEmail: string,
    customerName: string,
    orderId: string,
    orderNumber: string,
    certificates: Array<{
        documentName: string;
        documentType: string;
    }>
) {
    const certificatesList = certificates.map(cert =>
        `<li style="margin: 10px 0;"><strong>${cert.documentName}</strong> (${cert.documentType.replace(/_/g, ' ')})</li>`
    ).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .certificate-box { background: white; padding: 25px; margin: 25px 0; border-radius: 8px; border: 2px solid #8b5cf6; }
        .certificate-list { background: #fef3c7; padding: 20px; border-radius: 6px; margin: 15px 0; }
        .certificate-list ul { margin: 10px 0; padding-left: 20px; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #7c3aed; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; margin-top: 20px; }
        .success-icon { font-size: 48px; text-align: center; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">🎉</div>
            <h1>Your Certificates Are Ready!</h1>
        </div>
        <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Great news! Your certificates have been successfully processed and are now ready for download.</p>
            
            <div class="certificate-box">
                <h3 style="margin-top: 0; color: #8b5cf6;">Order Details</h3>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                
                <div class="certificate-list">
                    <p><strong>Available Certificates:</strong></p>
                    <ul>
                        ${certificatesList}
                    </ul>
                </div>
            </div>
            
            <p>You can download your certificates anytime from your order details page.</p>
            
            <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" class="button">
                    Download Certificates
                </a>
            </center>
            
            <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact us.</p>
            
            <p>Congratulations on completing your registration!</p>
            
            <p>Best regards,<br>
            <strong>LAWethic Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>For support, contact us at support@lawethic.com</p>
            <p>&copy; ${new Date().getFullYear()} LAWethic. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    return sendEmail({
        to: customerEmail,
        subject: `🎉 Your Certificates Are Ready - Order ${orderNumber}`,
        html,
    });
}
