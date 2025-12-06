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

        const emailData: any = {
            from: process.env.EMAIL_FROM || 'LawEthic <noreply@lawethic.com>',
            to: Array.isArray(options.to) ? options.to : [options.to],
            subject: options.subject,
        };

        if (options.html) emailData.html = options.html;
        if (options.text) emailData.text = options.text;
        if (options.attachments) emailData.attachments = options.attachments;

        const result = await client.emails.send(emailData);

        console.log('[Email] Sent successfully:', result.data?.id);
        return { success: true, id: result.data?.id };
    } catch (error: any) {
        console.error('[Email] Failed to send:', error);
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
            <strong>LawEthic Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} LawEthic. All rights reserved.</p>
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
LawEthic Team
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
            
            <p>We have successfully received your payment. Thank you for choosing LawEthic!</p>
            
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
            <strong>LawEthic Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} LawEthic. All rights reserved.</p>
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
            <strong>LawEthic Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} LawEthic. All rights reserved.</p>
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
            <strong>LawEthic Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} LawEthic. All rights reserved.</p>
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
