import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'node-appwrite';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, city, service, category, package: selectedPackage } = body;

        // Validate required fields
        if (!name || !email || !phone || !city || !service || !category) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Create lead in database
        const lead = await serverDatabases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.leads,
            ID.unique(),
            {
                name,
                email,
                phone,
                city,
                service,
                category,
                package: selectedPackage || 'Basic',
                status: 'new',
            }
        );

        // TODO: Send email notification to admin
        // You can add email notification here using your email service

        return NextResponse.json(
            {
                success: true,
                message: 'Lead submitted successfully',
                leadId: lead.$id
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json(
            { error: 'Failed to submit lead' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '100');

        // Build query using Query helper
        const { Query } = await import('node-appwrite');
        const queries = [Query.orderDesc('$createdAt'), Query.limit(limit)];

        if (status) {
            queries.push(Query.equal('status', status));
        }

        const leads = await serverDatabases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.leads,
            queries
        );

        return NextResponse.json(leads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leads' },
            { status: 500 }
        );
    }
}
