import { NextRequest, NextResponse } from 'next/server';
import { getRazorpay, formatAmountForRazorpay } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
    try {
        // Get Razorpay instance (lazy initialization)
        const razorpay = getRazorpay();

        if (!razorpay) {
            console.error('[Payment] Razorpay not configured - missing API keys', {
                hasKeyId: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
            });
            return NextResponse.json(
                { error: 'Payment service not configured. Please contact support.' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { amount, orderId, customerName, customerEmail } = body;

        if (!amount || !orderId) {
            return NextResponse.json(
                { error: 'Amount and orderId are required' },
                { status: 400 }
            );
        }

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: formatAmountForRazorpay(amount),
            currency: 'INR',
            receipt: orderId,
            notes: {
                order_id: orderId,
                customer_name: customerName || '',
                customer_email: customerEmail || '',
            },
        });

        return NextResponse.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        });
    } catch (error: any) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { error: 'Failed to create payment order', details: error.message },
            { status: 500 }
        );
    }
}
