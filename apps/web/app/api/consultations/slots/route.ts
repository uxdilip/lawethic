import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { generateSlotsForDateRange, AvailabilityRule, Booking } from '@/lib/consultation/slots';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const expertId = searchParams.get('expertId');
        const startDate = searchParams.get('startDate');
        const numDays = parseInt(searchParams.get('numDays') || '7');

        // Default to first available expert if not specified
        // For MVP, we use a single expert (admin)

        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const client = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.project)
            .setKey(apiKey);

        const databases = new Databases(client);

        // Get availability rules
        const availabilityQueries = expertId
            ? [Query.equal('expertId', expertId)]
            : [Query.limit(100)]; // Get all if no expert specified

        const availabilityRes = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.expertAvailability,
            availabilityQueries
        );

        // If no availability found, return empty
        if (availabilityRes.documents.length === 0) {
            return NextResponse.json({
                success: true,
                slots: [],
                message: 'No availability configured',
            });
        }

        // Get the expert ID from the first availability record
        const resolvedExpertId = expertId || availabilityRes.documents[0].expertId;

        // Map to AvailabilityRule format
        const availability: AvailabilityRule[] = availabilityRes.documents
            .filter((doc: any) => doc.expertId === resolvedExpertId)
            .map((doc: any) => ({
                dayOfWeek: doc.dayOfWeek,
                startTime: doc.startTime,
                endTime: doc.endTime,
                slotDuration: doc.slotDuration,
                bufferTime: doc.bufferTime,
                isActive: doc.isActive,
            }));

        // Get blocked dates
        const blockedRes = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.expertBlockedDates,
            [Query.equal('expertId', resolvedExpertId)]
        );
        const blockedDates = blockedRes.documents.map((doc: any) => doc.date);

        // Get existing bookings
        const start = startDate ? new Date(startDate) : new Date();
        const endDate = new Date(start);
        endDate.setDate(endDate.getDate() + numDays);

        const bookingsRes = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.consultationBookings,
            [
                Query.equal('expertId', resolvedExpertId),
                Query.greaterThanEqual('date', start.toISOString().split('T')[0]),
                Query.lessThanEqual('date', endDate.toISOString().split('T')[0]),
            ]
        );

        const existingBookings: Booking[] = bookingsRes.documents.map((doc: any) => ({
            date: doc.date,
            startTime: doc.startTime,
            endTime: doc.endTime,
            status: doc.status,
        }));

        // Generate slots
        const slots = generateSlotsForDateRange(
            start,
            numDays,
            availability,
            blockedDates,
            existingBookings,
            2 // minimum 2 hours advance booking
        );

        return NextResponse.json({
            success: true,
            expertId: resolvedExpertId,
            slots,
        });
    } catch (error: any) {
        console.error('[Slots] Error fetching:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
