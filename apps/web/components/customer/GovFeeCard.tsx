'use client';

import { useState } from 'react';
import { IndianRupee, AlertCircle, CheckCircle, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface FeeItem {
    name: string;
    amount: number;
    description?: string;
}

interface GovFeeRequest {
    $id: string;
    orderId: string;
    customerId: string;
    items: string | FeeItem[];
    totalAmount: number;
    status: 'pending' | 'paid' | 'cancelled';
    note?: string;
    razorpayOrderId?: string;
    paidAt?: string;
    $createdAt: string;
}

interface GovFeeCardProps {
    feeRequest: GovFeeRequest;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    onPaymentSuccess: () => void;
}

export default function GovFeeCard({
    feeRequest,
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    onPaymentSuccess,
}: GovFeeCardProps) {
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(feeRequest.status === 'pending');
    const [error, setError] = useState('');

    // Parse items if string
    const items: FeeItem[] = typeof feeRequest.items === 'string'
        ? JSON.parse(feeRequest.items)
        : feeRequest.items;

    const handlePayment = async () => {
        try {
            setLoading(true);
            setError('');

            // Create Razorpay order
            const orderResponse = await fetch('/api/payment/create-gov-fee-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feeRequestId: feeRequest.$id,
                    customerId,
                }),
            });

            const orderData = await orderResponse.json();
            if (!orderResponse.ok) {
                throw new Error(orderData.error || 'Failed to create payment order');
            }

            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load payment gateway'));
                    document.body.appendChild(script);
                });
            }

            // Open Razorpay checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: 'INR',
                name: 'LawEthic',
                description: 'Government Fee Payment',
                order_id: orderData.razorpayOrderId,
                prefill: {
                    name: customerName,
                    email: customerEmail,
                    contact: customerPhone || '',
                },
                theme: {
                    color: '#1e40af',
                },
                handler: async function (response: any) {
                    try {
                        // Verify payment
                        const verifyResponse = await fetch('/api/payment/verify-gov-fee-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                feeRequestId: feeRequest.$id,
                            }),
                        });

                        const verifyData = await verifyResponse.json();
                        if (!verifyResponse.ok) {
                            throw new Error(verifyData.error || 'Payment verification failed');
                        }

                        onPaymentSuccess();
                    } catch (err: any) {
                        setError(err.message);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isPending = feeRequest.status === 'pending';
    const isPaid = feeRequest.status === 'paid';

    return (
        <div className={`rounded-xl border ${isPending
            ? 'border-amber-200 bg-amber-50'
            : isPaid
                ? 'border-green-200 bg-green-50'
                : 'border-neutral-200 bg-neutral-50'
            }`}>
            {/* Header */}
            <div
                className="p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isPending
                            ? 'bg-amber-100'
                            : isPaid
                                ? 'bg-green-100'
                                : 'bg-neutral-100'
                            }`}>
                            {isPending ? (
                                <Clock className={`h-5 w-5 text-amber-600`} />
                            ) : isPaid ? (
                                <CheckCircle className={`h-5 w-5 text-green-600`} />
                            ) : (
                                <FileText className={`h-5 w-5 text-neutral-600`} />
                            )}
                        </div>
                        <div>
                            <h3 className="font-medium text-neutral-900">Government Fee</h3>
                            <p className="text-sm text-neutral-500">
                                {isPending
                                    ? 'Payment required to proceed'
                                    : isPaid
                                        ? `Paid on ${formatDate(feeRequest.paidAt!)}`
                                        : 'Cancelled'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${isPending ? 'text-amber-700' : isPaid ? 'text-green-700' : 'text-neutral-700'
                            }`}>
                            ₹{feeRequest.totalAmount.toLocaleString('en-IN')}
                        </span>
                        {expanded ? (
                            <ChevronUp className="h-5 w-5 text-neutral-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-neutral-400" />
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Note from operations */}
                    {feeRequest.note && (
                        <div className="p-3 bg-white rounded-lg border border-neutral-200">
                            <p className="text-sm text-neutral-600">{feeRequest.note}</p>
                        </div>
                    )}

                    {/* Fee breakdown */}
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        <div className="p-3 border-b border-neutral-100 bg-neutral-50">
                            <h4 className="text-sm font-medium text-neutral-700">Fee Breakdown</h4>
                        </div>
                        <div className="divide-y divide-neutral-100">
                            {items.map((item, index) => (
                                <div key={index} className="p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                                        {item.description && (
                                            <p className="text-xs text-neutral-500">{item.description}</p>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-neutral-900">
                                        ₹{item.amount.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
                            <span className="font-medium text-neutral-700">Total</span>
                            <span className="text-lg font-bold text-neutral-900">
                                ₹{feeRequest.totalAmount.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Pay Button */}
                    {isPending && (
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <IndianRupee className="h-4 w-4" />
                                    Pay ₹{feeRequest.totalAmount.toLocaleString('en-IN')}
                                </>
                            )}
                        </button>
                    )}

                    {/* Paid confirmation */}
                    {isPaid && (
                        <div className="flex items-center justify-center gap-2 p-3 bg-green-100 rounded-lg text-green-700">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Payment Completed</span>
                        </div>
                    )}

                    {/* Requested at */}
                    <p className="text-xs text-neutral-400 text-center">
                        Requested on {formatDate(feeRequest.$createdAt)}
                    </p>
                </div>
            )}
        </div>
    );
}
