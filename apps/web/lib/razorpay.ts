import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazy initialization - create Razorpay instance only when needed
let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay | null {
    if (razorpayInstance) {
        return razorpayInstance;
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        console.error('[Razorpay] Missing credentials:', {
            hasKeyId: !!keyId,
            hasKeySecret: !!keySecret,
            env: process.env.NODE_ENV,
        });
        return null;
    }

    razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });

    return razorpayInstance;
}

// Keep the old export for backward compatibility, but use getter
export const razorpay = {
    orders: {
        create: async (options: any) => {
            const instance = getRazorpay();
            if (!instance) {
                throw new Error('Razorpay not configured');
            }
            return instance.orders.create(options);
        }
    }
};

// Verify payment signature
export function verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
        console.error('[Razorpay] Cannot verify signature - RAZORPAY_KEY_SECRET not set');
        return false;
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
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
