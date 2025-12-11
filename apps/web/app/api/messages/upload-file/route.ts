import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage, ID } from 'node-appwrite';
import { cookies } from 'next/headers';

const BUCKET_ID = 'message-attachments';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
];

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File size exceeds 10MB limit' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG' },
                { status: 400 }
            );
        }

        // Validate file extension
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
            return NextResponse.json(
                { error: 'Invalid file extension' },
                { status: 400 }
            );
        }

        // Get user from session - verify user is authenticated
        const cookieStore = cookies();
        const allCookies = cookieStore.getAll();
        const sessionCookie = allCookies.find(c =>
            c.name.startsWith('a_session_') ||
            c.name === 'appwrite-session' ||
            c.name.includes('session')
        );

        if (!sessionCookie) {
            console.error('[Upload File API] No session cookie found');
            return NextResponse.json(
                { error: 'Unauthorized - Please login again' },
                { status: 401 }
            );
        }

        // Verify session is valid
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '';

        const userResponse = await fetch(`${endpoint}/account`, {
            headers: {
                'X-Appwrite-Project': projectId,
                'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
            }
        });

        if (!userResponse.ok) {
            console.error('[Upload File API] Session validation failed');
            return NextResponse.json(
                { error: 'Unauthorized - Invalid session' },
                { status: 401 }
            );
        }

        // Initialize Appwrite client with API key for server-side upload
        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            console.error('[Upload File API] APPWRITE_API_KEY is not set!');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
            .setKey(apiKey);

        const storage = new Storage(client);

        // Convert File to InputFile for Appwrite
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create a File-like object for Appwrite
        const inputFile = new File([buffer], file.name, { type: file.type });

        // Upload file to Appwrite Storage
        const uploadedFile = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            inputFile
        );

        // Return file metadata
        return NextResponse.json({
            success: true,
            file: {
                $id: uploadedFile.$id,
                name: uploadedFile.name,
                size: uploadedFile.sizeOriginal,
                mimeType: uploadedFile.mimeType,
            }
        });

    } catch (error: any) {
        console.error('[Upload File API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload file' },
            { status: 500 }
        );
    }
}
