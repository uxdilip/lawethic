import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import { appwriteConfig } from '@lawethic/appwrite/config';

export async function POST(request: NextRequest) {
    try {
        const { orderIds } = await request.json();

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid order IDs' },
                { status: 400 }
            );
        }

        // Initialize Appwrite client with API key for server-side operations
        const client = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.project)
            .setKey(process.env.APPWRITE_API_KEY || '');

        const databases = new Databases(client);

        // Delete all orders
        const deletePromises = orderIds.map(id =>
            databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                id
            )
        );

        await Promise.all(deletePromises);

        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${orderIds.length} case(s)`,
        });
    } catch (error: any) {
        console.error('Delete cases error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete cases' },
            { status: 500 }
        );
    }
}
