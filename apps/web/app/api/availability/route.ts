import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query, ID } from 'node-appwrite';
import { appwriteConfig } from '@lawethic/appwrite/config';

const DATABASE_ID = appwriteConfig.databaseId;
const COLLECTION_ID = appwriteConfig.collections.expertAvailability;

// Get availability for an expert (or all if no expertId)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const expertId = searchParams.get('expertId');

        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const client = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.project)
            .setKey(apiKey);

        const databases = new Databases(client);

        const queries = expertId
            ? [Query.equal('expertId', expertId)]
            : [];

        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);

        return NextResponse.json({
            success: true,
            availability: response.documents,
        });
    } catch (error: any) {
        console.error('[Availability] Error fetching:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Save availability settings
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { expertId, availability } = body;

        if (!expertId || !availability) {
            return NextResponse.json(
                { error: 'Missing expertId or availability data' },
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

        // Delete existing availability for this expert
        const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('expertId', expertId),
        ]);

        for (const doc of existing.documents) {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
        }

        // Create new availability records
        const created = [];
        for (const slot of availability) {
            if (!slot.isActive) continue;

            const doc = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    expertId,
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    slotDuration: slot.slotDuration || 30,
                    bufferTime: slot.bufferTime || 15,
                    isActive: slot.isActive,
                }
            );
            created.push(doc);
        }

        return NextResponse.json({
            success: true,
            message: 'Availability saved',
            count: created.length,
        });
    } catch (error: any) {
        console.error('[Availability] Error saving:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
