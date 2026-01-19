import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query, ID } from 'node-appwrite';
import { appwriteConfig } from '@lawethic/appwrite/config';

const DATABASE_ID = appwriteConfig.databaseId;
const COLLECTION_ID = appwriteConfig.collections.expertBlockedDates;

// Get blocked dates for an expert
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const expertId = searchParams.get('expertId');

        if (!expertId) {
            return NextResponse.json({ error: 'expertId is required' }, { status: 400 });
        }

        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const client = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.project)
            .setKey(apiKey);

        const databases = new Databases(client);

        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('expertId', expertId),
            Query.orderAsc('date'),
        ]);

        return NextResponse.json({
            success: true,
            blockedDates: response.documents,
        });
    } catch (error: any) {
        console.error('[BlockedDates] Error fetching:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Add a blocked date
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { expertId, date, reason } = body;

        if (!expertId || !date) {
            return NextResponse.json(
                { error: 'Missing expertId or date' },
                { status: 400 }
            );
        }

        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const client = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.project)
            .setKey(apiKey);

        const databases = new Databases(client);

        // Check if already blocked
        const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('expertId', expertId),
            Query.equal('date', date),
        ]);

        if (existing.documents.length > 0) {
            return NextResponse.json(
                { error: 'Date is already blocked' },
                { status: 400 }
            );
        }

        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
                expertId,
                date,
                reason: reason || '',
            }
        );

        return NextResponse.json({
            success: true,
            blockedDate: doc,
        });
    } catch (error: any) {
        console.error('[BlockedDates] Error adding:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Delete a blocked date
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const client = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.project)
            .setKey(apiKey);

        const databases = new Databases(client);

        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);

        return NextResponse.json({
            success: true,
            message: 'Blocked date removed',
        });
    } catch (error: any) {
        console.error('[BlockedDates] Error deleting:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
