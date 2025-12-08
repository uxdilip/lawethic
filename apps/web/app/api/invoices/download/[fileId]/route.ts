import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@lawethic/appwrite/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { fileId: string } }
) {
    try {
        const fileId = params.fileId;

        if (!fileId) {
            return NextResponse.json(
                { error: 'File ID is required' },
                { status: 400 }
            );
        }

        // TODO: Add authentication check and verify user owns the order
        // For now, anyone can download any invoice


        // Get the file download URL
        const fileBuffer = await serverStorage.getFileDownload('invoices', fileId);

        // Get file metadata to set proper headers
        const fileMetadata = await serverStorage.getFile('invoices', fileId);

        // Return the file as a blob
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileMetadata.name}"`,
            },
        });

    } catch (error: any) {
        console.error('[API] Invoice download failed:', error);
        return NextResponse.json(
            { error: 'Failed to download invoice', details: error.message },
            { status: error.code || 500 }
        );
    }
}
