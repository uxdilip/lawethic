import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
export const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Verify payment signature
export function verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
): boolean {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');

    return expectedSignature === razorpaySignature;
}

// Format amount for Razorpay (convert to paise)
export function formatAmountForRazorpay(amount: number): number {
    return Math.round(amount * 100);
}

// Format amount for display (convert from paise)
export function formatAmountForDisplay(amount: number): number {
    return amount / 100;
}
