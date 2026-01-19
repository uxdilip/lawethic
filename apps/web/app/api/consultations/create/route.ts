import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID, Query, Users } from 'node-appwrite';
import { appwriteConfig } from '@lawethic/appwrite/config';
import {
    ConsultationStatus,
    BusinessType,
    CaseType,
    CASE_TYPE_SUGGESTIONS,
    CASE_TYPE_LABELS,
    BUSINESS_TYPE_LABELS,
} from '@lawethic/appwrite/types';
import {
    sendConsultationConfirmationEmail,
    sendNewConsultationAdminAlert,
    sendNewConsultationExpertAlert,
} from '@/lib/email/email-service';

const DATABASE_ID = appwriteConfig.databaseId;
const COLLECTION_ID = appwriteConfig.collections.consultationCases;

// Generate case number: CASE-2026-0001
async function generateCaseNumber(databases: Databases): Promise<string> {
    const year = new Date().getFullYear();

    // Get the latest case number for this year
    try {
        const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.startsWith('caseNumber', `CASE-${year}`),
            Query.orderDesc('caseNumber'),
            Query.limit(1),
        ]);

        if (existing.documents.length > 0) {
            const lastNumber = existing.documents[0].caseNumber;
            const sequence = parseInt(lastNumber.split('-')[2], 10) + 1;
            return `CASE-${year}-${sequence.toString().padStart(4, '0')}`;
        }
    } catch (error) {
        // Collection might be empty or query failed
        console.log('No existing cases found, starting from 0001');
    }

    return `CASE-${year}-0001`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            businessType,
            caseType,
            title,
            description,
            attachments = [],
            customerName,
            customerEmail,
            customerPhone,
        } = body;

        // Validation
        if (!businessType || !caseType || !title || !description) {
            return NextResponse.json(
                { error: 'Missing required fields: businessType, caseType, title, description' },
                { status: 400 }
            );
        }

        if (!customerName || !customerEmail || !customerPhone) {
            return NextResponse.json(
                { error: 'Missing required contact fields: customerName, customerEmail, customerPhone' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate phone format (10 digits)
        const phoneRegex = /^\d{10}$/;
        const cleanPhone = customerPhone.replace(/\D/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            return NextResponse.json(
                { error: 'Phone number must be 10 digits' },
                { status: 400 }
            );
        }

        // Get user ID from session if logged in
        let customerId = 'guest';
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
            const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
                const [name, value] = cookie.trim().split('=');
                acc[name] = value;
                return acc;
            }, {} as Record<string, string>);

            const sessionCookieName = Object.keys(cookies).find(
                (name) => name.startsWith('a_session_') || name === 'appwrite-session'
            );

            if (sessionCookieName) {
                // User is logged in, get their ID
                try {
                    const userClient = new Client()
                        .setEndpoint(appwriteConfig.endpoint)
                        .setProject(appwriteConfig.project)
                        .setSession(cookies[sessionCookieName]);

                    const { Account } = await import('node-appwrite');
                    const account = new Account(userClient);
                    const user = await account.get();
                    customerId = user.$id;
                } catch (error) {
                    console.log('Could not get user from session, treating as guest');
                }
            }
        }

        // Initialize admin client
        const apiKey = process.env.APPWRITE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const adminClient = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.project)
            .setKey(apiKey);

        const databases = new Databases(adminClient);

        // Generate case number
        const caseNumber = await generateCaseNumber(databases);

        // Get auto-suggested services based on case type
        const suggestedServiceSlugs = CASE_TYPE_SUGGESTIONS[caseType as CaseType] || [];

        // Create case document
        const caseData = {
            caseNumber,
            customerId,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim().toLowerCase(),
            customerPhone: cleanPhone,
            businessType: businessType as BusinessType,
            caseType: caseType as CaseType,
            title: title.trim(),
            description: description.trim(),
            attachments: attachments || [],
            status: 'submitted' as ConsultationStatus,
            suggestedServiceSlugs,
            convertedOrderIds: [],
            amount: 0,
            paymentStatus: 'free',
        };

        const document = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            caseData
        );

        console.log(`[Consultations] Created case ${caseNumber} for ${customerEmail}`);

        // Send confirmation email to customer
        try {
            const caseTypeLabel = CASE_TYPE_LABELS[caseType as CaseType] || caseType;
            await sendConsultationConfirmationEmail(
                customerEmail,
                customerName,
                caseNumber,
                title,
                caseTypeLabel
            );
            console.log(`[Consultations] Sent confirmation email to ${customerEmail}`);
        } catch (emailError) {
            console.error('[Consultations] Failed to send confirmation email:', emailError);
            // Don't fail the request if email fails
        }

        // Send notification to admin
        try {
            const caseTypeLabel = CASE_TYPE_LABELS[caseType as CaseType] || caseType;
            const businessTypeLabel = BUSINESS_TYPE_LABELS[businessType as BusinessType] || businessType;
            await sendNewConsultationAdminAlert(
                caseNumber,
                customerName,
                customerEmail,
                cleanPhone,
                title,
                caseTypeLabel,
                businessTypeLabel
            );
            console.log('[Consultations] Sent admin notification');
        } catch (emailError) {
            console.error('[Consultations] Failed to send admin notification:', emailError);
            // Don't fail the request if email fails
        }

        // Send notification to all experts
        try {
            const users = new Users(adminClient);
            const allUsers = await users.list([Query.limit(100)]);

            // Filter users with expert role
            const expertEmails = allUsers.users
                .filter(u => u.prefs?.role === 'expert' && u.email)
                .map(u => u.email);

            if (expertEmails.length > 0) {
                const caseTypeLabel = CASE_TYPE_LABELS[caseType as CaseType] || caseType;
                const businessTypeLabel = BUSINESS_TYPE_LABELS[businessType as BusinessType] || businessType;
                await sendNewConsultationExpertAlert(
                    expertEmails,
                    caseNumber,
                    customerName,
                    title,
                    caseTypeLabel,
                    businessTypeLabel
                );
                console.log(`[Consultations] Sent notification to ${expertEmails.length} experts`);
            }
        } catch (emailError) {
            console.error('[Consultations] Failed to send expert notifications:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({
            success: true,
            caseId: document.$id,
            caseNumber: document.caseNumber,
            message: 'Case submitted successfully',
        });
    } catch (error: any) {
        console.error('[Consultations] Error creating case:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create case' },
            { status: 500 }
        );
    }
}
