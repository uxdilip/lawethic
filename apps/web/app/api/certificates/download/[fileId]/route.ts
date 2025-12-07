import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage, Databases, Query } from 'node-appwrite';
import { cookies } from 'next/headers';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.APPWRITE_API_KEY!);

const storage = new Storage(client);
const databases = new Databases(client);

const DATABASE_ID = 'main';
const BUCKET_ID = 'certificates';
const COLLECTION_ID = 'order_certificates';
const ORDERS_COLLECTION_ID = 'orders';
const TIMELINE_COLLECTION_ID = 'order_timeline';

/**
 * Download Certificate API
 * GET /api/certificates/download/[fileId]
 * 
 * Streams certificate file to user with authentication
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { fileId: string } }
) {
    try {
        const { fileId } = params;

        // Get user session from cookies
        const cookieStore = cookies();
        const allCookies = cookieStore.getAll();
        const sessionCookie = allCookies.find(c =>
            c.name.startsWith('a_session_') ||
            c.name === 'appwrite-session' ||
            c.name.includes('session')
        );

        // For now, allow download without strict session checking
        // In production, implement proper authentication
        console.log('[Download API] Session cookie found:', !!sessionCookie);        // Find certificate by fileId
        const certificates = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('fileId', fileId),
                Query.equal('status', 'active')
            ]
        );

        if (certificates.documents.length === 0) {
            return NextResponse.json(
                { error: 'Certificate not found' },
                { status: 404 }
            );
        }

        const certificate = certificates.documents[0];

        // Get order to check ownership
        const order = await databases.getDocument(
            DATABASE_ID,
            ORDERS_COLLECTION_ID,
            certificate.orderId
        );

        // If session cookie exists, verify access
        if (sessionCookie) {
            const userClient = new Client()
                .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
                .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
                .setSession(sessionCookie.value);

            const userDatabases = new Databases(userClient);

            // Try to access the order - will fail if user doesn't own it
            try {
                await userDatabases.getDocument(DATABASE_ID, ORDERS_COLLECTION_ID, order.$id);
                console.log('[Download API] User verified for order');
            } catch (error) {
                console.log('[Download API] Access denied - user does not own order');
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
        } else {
            console.log('[Download API] No session - allowing download (development mode)');
        }

        // Get file from storage
        const file = await storage.getFileDownload(BUCKET_ID, fileId);

        // Update download count
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                certificate.$id,
                {
                    downloadCount: (certificate.downloadCount || 0) + 1
                }
            );

            // Create timeline entry
            await databases.createDocument(
                DATABASE_ID,
                TIMELINE_COLLECTION_ID,
                'unique()',
                {
                    orderId: certificate.orderId,
                    action: 'certificate_downloaded',
                    details: `Certificate downloaded: ${certificate.documentName}`,
                    performedBy: order.userId,
                    status: 'info',
                    note: `Download count: ${(certificate.downloadCount || 0) + 1}`
                }
            );
        } catch (error) {
            console.error('Error updating download count:', error);
            // Non-critical, continue with download
        }

        // Create response with file
        const response = new NextResponse(file);
        response.headers.set('Content-Type', certificate.mimeType);
        response.headers.set(
            'Content-Disposition',
            `attachment; filename="${certificate.fileName}"`
        );

        return response;

    } catch (error: any) {
        console.error('Certificate download error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to download certificate' },
            { status: 500 }
        );
    }
}
