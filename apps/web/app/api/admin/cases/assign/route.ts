import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import { appwriteConfig } from '@lawethic/appwrite/config';

export async function POST(request: NextRequest) {
    try {
        const { orderId, assignedTo } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { success: false, error: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Initialize Appwrite client with API key for server-side operations
        const client = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.project)
            .setKey(process.env.APPWRITE_API_KEY || '');

        const databases = new Databases(client);

        // Update assignment
        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.orders,
            orderId,
            { assignedTo: assignedTo || null }
        );

        return NextResponse.json({
            success: true,
            message: 'Assignment updated successfully',
        });
    } catch (error: any) {
        console.error('Update assignment error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update assignment' },
            { status: 500 }
        );
    }
}
