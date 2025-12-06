'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PaymentButtonProps {
    amount: number;
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    serviceName: string;
    onSuccess?: () => void;
}

export default function PaymentButton({
    amount,
    orderId,
    orderNumber,
    customerName,
    customerEmail,
    serviceName,
    onSuccess,
}: PaymentButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setError('Failed to load payment gateway. Please try again.');
                setLoading(false);
                return;
            }

            // Create Razorpay order
            const response = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    orderId: orderNumber,
                    customerName,
                    customerEmail,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to create order');
            }

            // Open Razorpay checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: 'LawEthic',
                description: serviceName,
                order_id: data.orderId,
                prefill: {
                    name: customerName,
                    email: customerEmail,
                },
                theme: {
                    color: '#2563eb',
                },
                handler: async function (response: any) {
                    // Verify payment on backend
                    try {
                        const verifyResponse = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                order_id: orderNumber,
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            if (onSuccess) {
                                onSuccess();
                            } else {
                                router.push(`/dashboard?payment=success&orderId=${orderId}`);
                            }
                        } else {
                            setError('Payment verification failed. Please contact support.');
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        setError('Payment verification failed. Please contact support.');
                    } finally {
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        setError('Payment cancelled');
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err: any) {
            console.error('Payment error:', err);
            setError(err.message || 'Payment failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
                {loading ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
            </button>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="text-center text-sm text-gray-500">
                <p>Secure payment powered by Razorpay</p>
                <p className="mt-1">Accept UPI, Cards, Net Banking & Wallets</p>
            </div>
        </div>
    );
}
