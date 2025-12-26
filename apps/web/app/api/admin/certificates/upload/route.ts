import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage, Databases, ID, Query } from 'node-appwrite';
import { sendCertificateReadyEmail } from '@/lib/email/email-service';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const storage = new Storage(client);
const databases = new Databases(client);

const DATABASE_ID = 'main';
const BUCKET_ID = 'certificates';
const COLLECTION_ID = 'order_certificates';
const ORDERS_COLLECTION_ID = 'orders';
const TIMELINE_COLLECTION_ID = 'order_timeline';

/**
 * Upload Certificate API
 * POST /api/admin/certificates/upload
 * 
 * Handles certificate file uploads for orders
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const file = formData.get('file') as File;
        const orderId = formData.get('orderId') as string;
        const documentType = formData.get('documentType') as string;
        const documentName = formData.get('documentName') as string;
        const uploadedBy = formData.get('uploadedBy') as string;
        const uploadedByName = formData.get('uploadedByName') as string;

        // Validate required fields
        if (!file || !orderId || !documentType || !documentName || !uploadedBy || !uploadedByName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        if (file.size > 10485760) {
            return NextResponse.json(
                { error: 'File size exceeds 10MB limit' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX' },
                { status: 400 }
            );
        }

        // Verify order exists
        try {
            await databases.getDocument(DATABASE_ID, ORDERS_COLLECTION_ID, orderId);
        } catch (error) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Convert file to buffer for upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload using REST API (same approach as invoice generator)
        // This avoids the SDK's stream issues with Next.js
        const fileId = ID.unique();
        const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;

        // Build multipart body
        const headerParts = [
            `--${boundary}\r\n`,
            `Content-Disposition: form-data; name="fileId"\r\n\r\n`,
            `${fileId}\r\n`,
            `--${boundary}\r\n`,
            `Content-Disposition: form-data; name="file"; filename="${file.name}"\r\n`,
            `Content-Type: ${file.type}\r\n\r\n`,
        ].join('');

        const footerPart = `\r\n--${boundary}--\r\n`;

        const headerBuffer = Buffer.from(headerParts, 'utf-8');
        const footerBuffer = Buffer.from(footerPart, 'utf-8');
        const bodyBuffer = Buffer.concat([headerBuffer, buffer, footerBuffer]);

        const uploadResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files`,
            {
                method: 'POST',
                headers: {
                    'X-Appwrite-Project': process.env.NEXT_PUBLIC_APPWRITE_PROJECT!,
                    'X-Appwrite-Key': process.env.APPWRITE_API_KEY!,
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
                body: bodyBuffer,
            }
        );

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(`Storage upload failed: ${errorData.message || uploadResponse.statusText}`);
        }

        const uploadedFile = await uploadResponse.json();

        console.log('File uploaded to storage:', uploadedFile.$id);

        // Create certificate record
        const certificate = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
                orderId,
                documentType,
                documentName,
                fileName: file.name,
                fileId: uploadedFile.$id,
                fileSize: file.size,
                mimeType: file.type,
                uploadedBy,
                uploadedByName,
                uploadedAt: new Date().toISOString(),
                downloadCount: 0,
                status: 'active'
            }
        );

        console.log('Certificate record created:', certificate.$id);

        // Create timeline entry
        await databases.createDocument(
            DATABASE_ID,
            TIMELINE_COLLECTION_ID,
            ID.unique(),
            {
                orderId,
                action: 'certificate_uploaded',
                details: `Certificate uploaded: ${documentName}`,
                performedBy: uploadedBy,
                status: 'info',
                note: `Document Type: ${documentType}`,
                updatedBy: uploadedByName
            }
        );

        console.log('Timeline entry created');

        // Send email notification to customer
        try {
            console.log('📧 Fetching order details for email notification...');
            const order = await databases.getDocument(DATABASE_ID, ORDERS_COLLECTION_ID, orderId);
            console.log('📧 Order fetched:', {
                orderId: order.$id,
                orderNumber: order.orderNumber,
                hasFormData: !!order.formData,
                hasCustomerEmail: !!order.customerEmail
            });

            // Send email notification to customer
            try {
                // Parse formData if needed
                let formData = order.formData;
                if (typeof formData === 'string') {
                    console.log('📧 Parsing formData string...');
                    formData = JSON.parse(formData);
                }

                const customerEmail = formData?.email || order.customerEmail;
                const customerName = formData?.fullName || formData?.businessName || 'Customer';

                console.log('📧 Email details:', {
                    customerEmail,
                    customerName,
                    hasCertificateData: !!documentName && !!documentType
                });

                if (customerEmail) {
                    console.log('📧 Sending certificate ready email to:', customerEmail);
                    const emailResult = await sendCertificateReadyEmail(
                        customerEmail,
                        customerName,
                        orderId,
                        order.orderNumber || orderId,
                        [{ documentName, documentType }]
                    );
                    console.log('✅ Certificate ready email sent!', emailResult);
                } else {
                    console.warn('⚠️ No customer email found - email not sent');
                }
            } catch (emailError: any) {
                console.error('❌ Error sending certificate email:', {
                    message: emailError.message,
                    stack: emailError.stack,
                    fullError: emailError
                });
                // Non-critical, continue
            }
        } catch (error: any) {
            console.error('❌ Error fetching order for email:', {
                message: error.message,
                orderId
            });
            // Non-critical, continue
        }

        return NextResponse.json({
            success: true,
            certificate: {
                id: certificate.$id,
                fileId: uploadedFile.$id,
                documentName,
                documentType,
                fileName: file.name,
                fileSize: file.size,
                uploadedAt: certificate.uploadedAt
            }
        });

    } catch (error: any) {
        console.error('Certificate upload error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            type: error.type,
            response: error.response
        });
        return NextResponse.json(
            { error: error.message || 'Failed to upload certificate' },
            { status: 500 }
        );
    }
}
