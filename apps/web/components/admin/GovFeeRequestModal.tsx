'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, AlertCircle, Info } from 'lucide-react';

// Predefined government fees by service
const GOVERNMENT_FEES: Record<string, { name: string; amount: number; description?: string }[]> = {
    'trademark-registration': [
        { name: 'Trademark Filing Fee (Individual/Startup)', amount: 4500, description: 'Government fee for individual/startup' },
        { name: 'Trademark Filing Fee (Company/LLP)', amount: 9000, description: 'Government fee for company/LLP' },
    ],
    'fssai-registration': [
        { name: 'FSSAI Basic Registration Fee', amount: 100, description: 'Government fee for 1-5 years' },
    ],
    'fssai-license': [
        { name: 'FSSAI State License Fee (1 Year)', amount: 2000, description: 'Annual state license fee' },
        { name: 'FSSAI State License Fee (5 Years)', amount: 5000, description: '5-year state license fee' },
        { name: 'FSSAI Central License Fee (1 Year)', amount: 7500, description: 'Annual central license fee' },
        { name: 'FSSAI Central License Fee (5 Years)', amount: 18750, description: '5-year central license fee' },
    ],
    'trade-license': [
        { name: 'Trade License Application Fee', amount: 2500, description: 'Municipal trade license fee' },
    ],
    'import-export-code': [
        { name: 'IEC Registration Fee', amount: 500, description: 'Government fee for IEC' },
    ],
    'udyam-registration': [
        { name: 'Udyam/MSME Registration', amount: 0, description: 'Free government registration' },
    ],
    'professional-tax': [
        { name: 'Professional Tax Registration', amount: 500, description: 'State registration fee' },
    ],
    'shop-establishment': [
        { name: 'Shop & Establishment License Fee', amount: 1500, description: 'Municipal license fee' },
    ],
    'copyright-registration': [
        { name: 'Copyright Filing Fee (Literary/Artistic)', amount: 500, description: 'Government fee' },
        { name: 'Copyright Filing Fee (Music/Sound)', amount: 2000, description: 'Sound recording fee' },
    ],
    'patent-registration': [
        { name: 'Patent Filing Fee (Individual/Startup)', amount: 1600, description: 'Patent filing fee' },
        { name: 'Patent Filing Fee (Company)', amount: 8000, description: 'Company patent fee' },
    ],
};

interface FeeItem {
    id: string;
    name: string;
    amount: number;
    description?: string;
    isCustom: boolean;
}

interface GovFeeRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    customerId: string;
    serviceId: string;
    serviceName: string;
    onSuccess: () => void;
}

export default function GovFeeRequestModal({
    isOpen,
    onClose,
    orderId,
    customerId,
    serviceId,
    serviceName,
    onSuccess,
}: GovFeeRequestModalProps) {
    const [items, setItems] = useState<FeeItem[]>([]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Get predefined fees for this service
    const predefinedFees = GOVERNMENT_FEES[serviceId] || [];

    useEffect(() => {
        if (isOpen && items.length === 0 && predefinedFees.length > 0) {
            // Auto-add first predefined fee if available
            setItems([{
                id: `fee-${Date.now()}`,
                name: predefinedFees[0].name,
                amount: predefinedFees[0].amount,
                description: predefinedFees[0].description,
                isCustom: false,
            }]);
        }
    }, [isOpen, serviceId]);

    const isFeeAdded = (feeName: string) => {
        return items.some(item => item.name === feeName && !item.isCustom);
    };

    const togglePredefinedFee = (fee: { name: string; amount: number; description?: string }) => {
        if (isFeeAdded(fee.name)) {
            // Remove the fee
            setItems(items.filter(item => !(item.name === fee.name && !item.isCustom)));
        } else {
            // Add the fee
            setItems([...items, {
                id: `fee-${Date.now()}`,
                name: fee.name,
                amount: fee.amount,
                description: fee.description,
                isCustom: false,
            }]);
        }
    };

    const addCustomFee = () => {
        setItems([...items, {
            id: `fee-${Date.now()}`,
            name: '',
            amount: 0,
            isCustom: true,
        }]);
    };

    const updateItem = (id: string, field: 'name' | 'amount' | 'description', value: string | number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const handleSubmit = async () => {
        // Validation
        if (items.length === 0) {
            setError('Please add at least one fee item');
            return;
        }

        const invalidItems = items.filter(item => !item.name || item.amount <= 0);
        if (invalidItems.length > 0) {
            setError('All items must have a name and amount greater than 0');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/admin/orders/request-gov-fee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    customerId,
                    serviceId,
                    items: items.map(item => ({
                        name: item.name,
                        amount: Number(item.amount),
                        description: item.description || '',
                    })),
                    note: note.trim(),
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create fee request');
            }

            onSuccess();
            onClose();
            resetForm();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setItems([]);
        setNote('');
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-neutral-900">Request Government Fee</h2>
                        <p className="text-sm text-neutral-500 mt-1">{serviceName}</p>
                    </div>
                    <button
                        onClick={() => { onClose(); resetForm(); }}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-neutral-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Predefined Fees */}
                    {predefinedFees.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-neutral-700 mb-3">
                                Select Fees
                            </h3>
                            <div className="grid gap-2">
                                {predefinedFees.map((fee, index) => {
                                    const isAdded = isFeeAdded(fee.name);
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => togglePredefinedFee(fee)}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${isAdded
                                                ? 'bg-brand-50 border-brand-200'
                                                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium text-neutral-900">{fee.name}</p>
                                                {fee.description && (
                                                    <p className="text-xs text-neutral-500 mt-0.5">{fee.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-neutral-900">
                                                    {fee.amount.toLocaleString('en-IN')}
                                                </span>
                                                <div className={`p-1 rounded ${isAdded ? 'bg-brand-600 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                                                    {isAdded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* No predefined fees notice */}
                    {predefinedFees.length === 0 && (
                        <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                            <Info className="h-5 w-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-neutral-700">No predefined fees</p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    Add custom fee items below.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Custom Fees Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-neutral-700">Custom Fees</h3>
                            <button
                                onClick={addCustomFee}
                                className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Add Custom
                            </button>
                        </div>

                        {items.filter(item => item.isCustom).length > 0 && (
                            <div className="space-y-3">
                                {items.filter(item => item.isCustom).map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="Fee name"
                                                    value={item.name}
                                                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                                                />
                                                <div className="flex gap-3">
                                                    <input
                                                        type="number"
                                                        placeholder="Amount"
                                                        value={item.amount || ''}
                                                        onChange={(e) => updateItem(item.id, 'amount', Number(e.target.value))}
                                                        className="w-32 px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Description (optional)"
                                                        value={item.description || ''}
                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Note for Customer (Optional)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add any additional information..."
                            rows={2}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm resize-none"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-neutral-600">Total Amount</span>
                        <span className="text-2xl font-bold text-neutral-900">
                            {totalAmount.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { onClose(); resetForm(); }}
                            className="flex-1 px-4 py-3 border border-neutral-200 rounded-lg font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || items.length === 0 || totalAmount <= 0}
                            className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
