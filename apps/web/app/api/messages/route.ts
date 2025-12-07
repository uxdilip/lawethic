import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID, Query } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const MESSAGES_COLLECTION = 'messages';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
        }

        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
            .setKey(process.env.APPWRITE_API_KEY || '');

        const databases = new Databases(client);

        // Fetch messages for this order, sorted by creation time
        const messages = await databases.listDocuments(
            DATABASE_ID,
            MESSAGES_COLLECTION,
            [
                Query.equal('orderId', orderId),
                Query.orderAsc('$createdAt'),
                Query.limit(100)
            ]
        );

        return NextResponse.json({
            success: true,
            messages: messages.documents
        });

    } catch (error: any) {
        console.error('[Messages API] Error fetching messages:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}
