import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { serverDatabases, appwriteConfig } from '@lawethic/appwrite';
import { ID, Query } from 'appwrite';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_id,
        } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
            return NextResponse.json(
                { error: 'Missing required payment details' },
                { status: 400 }
            );
        }

        // Verify signature
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Update order in database
        try {
            // Get the order first to update it
            const orders = await serverDatabases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                [Query.equal('orderNumber', order_id)]
            );

            if (orders.documents.length === 0) {
                return NextResponse.json(
                    { error: 'Order not found' },
                    { status: 404 }
                );
            }

            const order = orders.documents[0];

            // Update order with payment details
            await serverDatabases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                order.$id,
                {
                    paymentStatus: 'success',
                    paymentId: razorpay_payment_id,
                    status: 'paid',
                }
            );

            // Create payment record
            await serverDatabases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.payments,
                ID.unique(),
                {
                    orderId: order.$id,
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    amount: order.amount,
                    status: 'success',
                    method: 'razorpay',
                }
            );

            // TODO: Create order timeline entry
            // TODO: Send confirmation email
            // TODO: Create notification

            return NextResponse.json({
                success: true,
                message: 'Payment verified successfully',
                orderId: order.$id,
            });
        } catch (dbError: any) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Failed to update order', details: dbError.message },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: 'Payment verification failed', details: error.message },
            { status: 500 }
        );
    }
}
