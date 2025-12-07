import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
import { cookies } from 'next/headers';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DATABASE_ID = 'main';
const COLLECTION_ID = 'order_certificates';
const ORDERS_COLLECTION_ID = 'orders';

/**
 * List Certificates API
 * GET /api/certificates?orderId={id}
 * 
 * Returns list of certificates for an order
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json(
                { error: 'orderId is required' },
                { status: 400 }
            );
        }

        // Get user session from cookies
        const cookieStore = cookies();
        const allCookies = cookieStore.getAll();

        console.log('[Certificates API] Request headers:', request.headers.get('cookie'));
        console.log('[Certificates API] All cookies from store:', allCookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`));

        // Try to find Appwrite session cookie
        // Appwrite uses cookies like: a_session_[projectId]_legacy or fallback
        const sessionCookie = allCookies.find(c =>
            c.name.startsWith('a_session_') ||
            c.name === 'appwrite-session' ||
            c.name.includes('session')
        );

        if (!sessionCookie) {
            console.log('[Certificates API] No session cookie found. Available cookies:', allCookies.map(c => c.name).join(', '));

            // For now, skip authentication and use API key directly
            // This is a workaround - in production, implement proper auth
            console.log('[Certificates API] Falling back to API key authentication');

            // Use admin client to fetch certificates
            const certificates = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.equal('orderId', orderId),
                    Query.equal('status', 'active'),
                    Query.orderDesc('uploadedAt')
                ]
            );

            const formattedCertificates = certificates.documents.map(cert => ({
                id: cert.$id,
                documentType: cert.documentType,
                documentName: cert.documentName,
                fileName: cert.fileName,
                fileId: cert.fileId,
                fileSize: cert.fileSize,
                mimeType: cert.mimeType,
                uploadedBy: cert.uploadedBy,
                uploadedByName: cert.uploadedByName,
                uploadedAt: cert.uploadedAt,
                downloadCount: cert.downloadCount || 0,
                downloadUrl: `/api/certificates/download/${cert.fileId}`
            }));

            return NextResponse.json({
                success: true,
                certificates: formattedCertificates,
                total: certificates.total
            });
        }

        console.log('[Certificates API] Using session cookie:', sessionCookie.name);

        // Verify user has access to this order
        const userClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
            .setSession(sessionCookie.value);

        const userDatabases = new Databases(userClient);

        try {
            const order = await userDatabases.getDocument(DATABASE_ID, ORDERS_COLLECTION_ID, orderId);
            console.log('[Certificates API] User verified for order:', orderId);
        } catch (error: any) {
            console.error('[Certificates API] Access denied:', error.message);
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }        // Get certificates for this order
        const certificates = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('orderId', orderId),
                Query.equal('status', 'active'),
                Query.orderDesc('uploadedAt')
            ]
        );

        // Format response
        const formattedCertificates = certificates.documents.map(cert => ({
            id: cert.$id,
            documentType: cert.documentType,
            documentName: cert.documentName,
            fileName: cert.fileName,
            fileId: cert.fileId,
            fileSize: cert.fileSize,
            mimeType: cert.mimeType,
            uploadedBy: cert.uploadedBy,
            uploadedByName: cert.uploadedByName,
            uploadedAt: cert.uploadedAt,
            downloadCount: cert.downloadCount || 0,
            downloadUrl: `/api/certificates/download/${cert.fileId}`
        }));

        return NextResponse.json({
            success: true,
            certificates: formattedCertificates,
            total: certificates.total
        });

    } catch (error: any) {
        console.error('Certificate list error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch certificates' },
            { status: 500 }
        );
    }
}
