import { serverDatabases as databases, serverStorage as storage } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query, ID } from 'node-appwrite';
import { InvoiceData, InvoiceCounter } from './invoice-types';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceTemplate } from './invoice-template';
import React from 'react';
import { sendInvoiceEmail } from '../email/email-service';

/**
 * Generate next invoice number for the current year
 */
export async function generateInvoiceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();

    try {
        // Find counter for current year
        const counters = await databases.listDocuments(
            appwriteConfig.databaseId,
            'invoice_counter',
            [Query.equal('year', currentYear)]
        );

        let counter: InvoiceCounter;

        if (counters.documents.length === 0) {
            // Create new counter for this year
            const newCounter = await databases.createDocument(
                appwriteConfig.databaseId,
                'invoice_counter',
                ID.unique(),
                {
                    year: currentYear,
                    lastNumber: 1,
                    prefix: 'INV'
                }
            );
            counter = newCounter as unknown as InvoiceCounter;
        } else {
            // Increment existing counter
            counter = counters.documents[0] as unknown as InvoiceCounter;
            const nextNumber = counter.lastNumber + 1;

            await databases.updateDocument(
                appwriteConfig.databaseId,
                'invoice_counter',
                counter.$id,
                {
                    lastNumber: nextNumber
                }
            );

            counter.lastNumber = nextNumber;
        }

        // Format: INV-2024-0001
        const invoiceNumber = `${counter.prefix}-${currentYear}-${String(counter.lastNumber).padStart(4, '0')}`;
        return invoiceNumber;
    } catch (error) {
        console.error('Failed to generate invoice number:', error);
        throw new Error('Failed to generate invoice number');
    }
}

/**
 * Generate invoice PDF and upload to Appwrite storage
 */
export async function generateInvoice(orderId: string): Promise<{ invoiceNumber: string; fileId: string }> {
    try {

        // 1. Fetch order details
        const order = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.orders,
            orderId
        );

        // Parse formData if string
        if (typeof order.formData === 'string') {
            order.formData = JSON.parse(order.formData);
        }

        // 2. Fetch service details
        const service = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.services,
            order.serviceId
        );

        // 3. Generate invoice number
        const invoiceNumber = await generateInvoiceNumber();

        // 4. Prepare invoice data
        const invoiceData: InvoiceData = {
            invoiceNumber,
            invoiceDate: new Date().toISOString(),
            orderNumber: order.orderNumber,

            // Customer details
            customerName: order.formData?.fullName || order.formData?.businessName || 'Customer',
            customerEmail: order.formData?.email || '',
            customerPhone: order.formData?.phone || '',
            businessName: order.formData?.businessName || '',

            // Service details
            serviceName: service.name,
            serviceDescription: service.shortDescription || service.description || '',
            features: service.features || [],

            // Payment details
            amount: order.amount,
            currency: order.currency || 'INR',
            paymentMethod: 'Razorpay',
            transactionId: order.razorpayOrderId || order.razorpayPaymentId || 'N/A',
            paymentDate: order.paidAt || order.$updatedAt,

            // Order details
            orderId: order.$id,
        };

        // 5. Generate PDF
        // @ts-ignore - renderToBuffer types are incorrect
        const pdfBuffer = await renderToBuffer(
            React.createElement(InvoiceTemplate, { data: invoiceData })
        );

        // 6. Create bucket if it doesn't exist (will fail silently if exists)
        try {
            await storage.createBucket(
                'invoices',
                'Invoices',
                ['read("user:' + order.customerId + '")', 'read("team:admin")', 'read("team:operations")'],
                false, // not public
                undefined,
                undefined,
                ['pdf']
            );
        } catch (error: any) {
            if (error.code !== 409) { // 409 = already exists
            }
        }

        // 7. Upload PDF to storage using proper multipart encoding with Buffer
        const fileName = `invoice-${invoiceNumber}.pdf`;
        const fileId = ID.unique();

        // Create multipart payload with proper binary handling
        const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;

        // Build the multipart body as separate buffers to preserve binary data
        const textEncoder = new TextEncoder();
        const headerParts = [
            `--${boundary}\r\n`,
            `Content-Disposition: form-data; name="fileId"\r\n\r\n`,
            `${fileId}\r\n`,
            `--${boundary}\r\n`,
            `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`,
            `Content-Type: application/pdf\r\n\r\n`,
        ].join('');

        const footerPart = `\r\n--${boundary}--\r\n`;

        // Concatenate buffers properly to preserve PDF binary data
        const headerBuffer = Buffer.from(headerParts, 'utf-8');
        const footerBuffer = Buffer.from(footerPart, 'utf-8');
        const bodyBuffer = Buffer.concat([headerBuffer, pdfBuffer, footerBuffer]);

        const uploadResponse = await fetch(
            `${appwriteConfig.endpoint}/storage/buckets/invoices/files`,
            {
                method: 'POST',
                headers: {
                    'X-Appwrite-Project': appwriteConfig.project,
                    'X-Appwrite-Key': process.env.APPWRITE_API_KEY || '',
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                    'Content-Length': bodyBuffer.length.toString(),
                },
                body: bodyBuffer,
            }
        );

        if (!uploadResponse.ok) {
            const error = await uploadResponse.text();
            throw new Error(`Upload failed: ${error}`);
        }

        const uploadedFile = await uploadResponse.json();

        // 8. Update order with invoice details
        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.orders,
            orderId,
            {
                invoiceFileId: uploadedFile.$id,
                invoiceNumber: invoiceNumber,
                invoiceGeneratedAt: new Date().toISOString()
            }
        );

        // 9. Create timeline entry
        try {
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orderTimeline,
                ID.unique(),
                {
                    orderId: orderId,
                    action: 'invoice_generated',
                    details: `Invoice ${invoiceNumber} generated and sent to customer`,
                    performedBy: 'system',
                    // Legacy fields for backward compatibility
                    status: 'completed',
                    note: `Invoice ${invoiceNumber} generated`,
                    updatedBy: 'system'
                }
            );
        } catch (error) {
            console.error('[Invoice] Failed to create timeline entry:', error);
            // Non-critical, continue even if timeline fails
        }


        // 10. Send invoice email to customer
        try {
            const emailResult = await sendInvoiceEmail(
                invoiceData.customerEmail,
                invoiceData.customerName,
                invoiceNumber,
                order.orderNumber,
                invoiceData.serviceName,
                invoiceData.amount,
                pdfBuffer
            );

            if (emailResult.success) {
            } else {
                console.warn('[Invoice] Email sending failed:', emailResult.error);
                // Non-critical, continue even if email fails
            }
        } catch (error) {
            console.error('[Invoice] Failed to send email:', error);
            // Non-critical, continue even if email fails
        }

        return {
            invoiceNumber,
            fileId: uploadedFile.$id
        };

    } catch (error) {
        console.error('[Invoice] Generation failed:', error);
        throw error;
    }
}

/**
 * Get invoice download URL
 */
export function getInvoiceDownloadUrl(fileId: string): string {
    return storage.getFileDownload('invoices', fileId).toString();
}
