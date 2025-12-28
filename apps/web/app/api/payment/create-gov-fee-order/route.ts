import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { serverDatabases } from '@lawethic/appwrite/server';
import { appwriteConfig } from '@lawethic/appwrite/config';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { feeRequestId, customerId } = body;

        if (!feeRequestId || !customerId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get the fee request
        const feeRequest = await serverDatabases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.governmentFeeRequests,
            feeRequestId
        );

        if (!feeRequest) {
            return NextResponse.json(
                { success: false, error: 'Fee request not found' },
                { status: 404 }
            );
        }

        if (feeRequest.customerId !== customerId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        if (feeRequest.status === 'paid') {
            return NextResponse.json(
                { success: false, error: 'Fee already paid' },
                { status: 400 }
            );
        }

        // Get customer details for receipt
        let customerEmail = 'customer@example.com';
        let customerName = 'Customer';
        try {
            const orderDoc = await serverDatabases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                feeRequest.orderId
            );
            customerEmail = orderDoc.customerEmail || customerEmail;
            customerName = orderDoc.customerName || customerName;
        } catch (err) {
            console.error('Failed to get order details:', err);
        }

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: feeRequest.totalAmount * 100, // Convert to paise
            currency: 'INR',
            receipt: `gov_fee_${feeRequestId.substring(0, 20)}`,
            notes: {
                type: 'government_fee',
                feeRequestId,
                orderId: feeRequest.orderId,
                customerId,
            },
        });

        // Update fee request with Razorpay order ID
        await serverDatabases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.governmentFeeRequests,
            feeRequestId,
            {
                razorpayOrderId: razorpayOrder.id,
            }
        );

        return NextResponse.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: feeRequest.totalAmount,
            currency: 'INR',
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            prefill: {
                email: customerEmail,
                name: customerName,
            },
            notes: {
                feeRequestId,
                orderId: feeRequest.orderId,
            },
        });
    } catch (error: any) {
        console.error('Failed to create Razorpay order for gov fee:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create payment order' },
            { status: 500 }
        );
    }
}
