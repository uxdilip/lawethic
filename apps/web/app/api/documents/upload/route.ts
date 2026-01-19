import { NextRequest, NextResponse } from 'next/server';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { ID } from 'node-appwrite';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const bucket = formData.get('bucket') as string || appwriteConfig.buckets.consultationAttachments;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Generate unique file ID
        const fileId = ID.unique();
        const fileName = file.name;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Use manual multipart fetch (Node SDK fails in Next.js API routes)
        const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
        const headerParts = `--${boundary}\r\nContent-Disposition: form-data; name="fileId"\r\n\r\n${fileId}\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;
        const bodyBuffer = Buffer.concat([
            Buffer.from(headerParts),
            fileBuffer,
            Buffer.from(`\r\n--${boundary}--\r\n`)
        ]);

        const uploadResponse = await fetch(
            `${appwriteConfig.endpoint}/storage/buckets/${bucket}/files`,
            {
                method: 'POST',
                headers: {
                    'X-Appwrite-Project': appwriteConfig.project,
                    'X-Appwrite-Key': apiKey,
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                },
                body: bodyBuffer,
            }
        );

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Appwrite upload error:', errorText);
            return NextResponse.json(
                { error: 'Failed to upload file to storage' },
                { status: 500 }
            );
        }

        const uploadResult = await uploadResponse.json();

        return NextResponse.json({
            success: true,
            fileId: uploadResult.$id,
            fileName: fileName,
        });
    } catch (error: any) {
        console.error('Failed to upload document:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload file' },
            { status: 500 }
        );
    }
}
