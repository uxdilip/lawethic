import { NextRequest, NextResponse } from 'next/server';
import { razorpay, formatAmountForRazorpay } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
    try {
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
