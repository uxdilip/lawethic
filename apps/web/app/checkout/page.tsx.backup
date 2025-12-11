'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { databases, appwriteConfig, account, storage } from '@lawethic/appwrite';
import { Service, Order } from '@lawethic/appwrite/types';
import { CheckCircle, Upload, FileText, CreditCard } from 'lucide-react';
import { ID, Query } from 'appwrite';
import PaymentButton from '@/components/PaymentButton';
import Header from '@/components/Header';

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const serviceId = searchParams.get('serviceId');

    const [user, setUser] = useState<any>(null);
    const [service, setService] = useState<Service | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orderId, setOrderId] = useState('');
    const [orderNumber, setOrderNumber] = useState('');

    // Form data
    const [formData, setFormData] = useState<any>({});
    const [documents, setDocuments] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        init();
    }, [serviceId]);

    const init = async () => {
        try {
            // Check authentication
            const userData = await account.get();
            setUser(userData);

            if (!serviceId) {
                router.push('/services');
                return;
            }

            // Fetch service
            const serviceResponse = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.services,
                serviceId
            );
            setService(serviceResponse as unknown as Service);
        } catch (err) {
            router.push('/login?redirect=/checkout?serviceId=' + serviceId);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Create order
            const orderNum = `ORD-${Date.now()}`;
            setOrderNumber(orderNum);

            // Add user email to formData
            const formDataWithEmail = {
                ...formData,
                email: user.email, // Include logged-in user's email
                fullName: user.name || formData.businessName, // Use name if available
            };

            const orderData = {
                orderNumber: orderNum,
                customerId: user.$id,
                serviceId: service!.$id,
                status: 'new',
                paymentStatus: 'pending',
                amount: service!.price,
                formData: JSON.stringify(formDataWithEmail),
            };

            const order = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                ID.unique(),
                orderData
            );

            setOrderId(order.$id);
            setStep(2);
        } catch (err: any) {
            setError(err.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments([...documents, ...Array.from(e.target.files)]);
        }
    };

    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setUploading(true);

        try {
            // Upload documents
            for (const file of documents) {
                const uploadedFile = await storage.createFile(
                    appwriteConfig.buckets.customerDocuments,
                    ID.unique(),
                    file
                );

                // Create document record
                await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.documents,
                    ID.unique(),
                    {
                        orderId,
                        fileId: uploadedFile.$id,
                        fileName: file.name,
                        fileType: file.type,
                        uploadedBy: user.$id,
                        status: 'pending', // Explicitly set status
                    }
                );
            }

            setStep(3);
        } catch (err: any) {
            setError(err.message || 'Failed to upload documents');
        } finally {
            setUploading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setStep(4); // Move to confirmation step
    };

    const handleConfirm = () => {
        router.push(`/dashboard`);
    };

    if (loading && step === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Service not found</h1>
                    <Link href="/services" className="text-blue-600 hover:underline">
                        Back to Services
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Checkout Steps */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8 overflow-x-auto">
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                    1
                                </div>
                                <span className="ml-2 font-medium text-sm">Details</span>
                            </div>
                            <div className="w-8 md:w-16 h-1 bg-gray-300"></div>
                            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                    2
                                </div>
                                <span className="ml-2 font-medium text-sm">Documents</span>
                            </div>
                            <div className="w-8 md:w-16 h-1 bg-gray-300"></div>
                            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                    3
                                </div>
                                <span className="ml-2 font-medium text-sm">Payment</span>
                            </div>
                            <div className="w-8 md:w-16 h-1 bg-gray-300"></div>
                            <div className={`flex items-center ${step >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                    4
                                </div>
                                <span className="ml-2 font-medium text-sm">Done</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Details Form */}
                    {step === 1 && (
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-bold mb-6">Application Details</h2>
                            <div className="mb-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900">{service.name}</h3>
                                    <p className="text-sm text-blue-700 mt-1">Price: ₹{service.price.toLocaleString()}</p>
                                </div>
                            </div>

                            <form onSubmit={handleStep1Submit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                            value={user?.email || ''}
                                            readOnly
                                            title="Email from your account"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Using email from your account</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Business Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.businessName || ''}
                                            onChange={(e) => handleFormChange('businessName', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            PAN Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                                            placeholder="ABCDE1234F"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.panNumber || ''}
                                            onChange={(e) => handleFormChange('panNumber', e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Business Address *
                                        </label>
                                        <textarea
                                            required
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.address || ''}
                                            onChange={(e) => handleFormChange('address', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            pattern="[0-9]{10}"
                                            placeholder="9876543210"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.mobile || ''}
                                            onChange={(e) => handleFormChange('mobile', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-between">
                                    <Link
                                        href="/services"
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Continue to Documents'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 2: Document Upload */}
                    {step === 2 && (
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-bold mb-6">Upload Documents</h2>

                            <div className="mb-6">
                                <h3 className="font-semibold mb-3">Required Documents:</h3>
                                <ul className="space-y-2">
                                    {service.documentRequired?.map((doc, index) => (
                                        <li key={index} className="flex items-start">
                                            <FileText className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                                            <span className="text-gray-700">{doc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <form onSubmit={handleStep2Submit}>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <label className="cursor-pointer">
                                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                                            Click to upload
                                        </span>
                                        <span className="text-gray-600"> or drag and drop</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG up to 10MB each</p>
                                </div>

                                {documents.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-medium mb-2">Selected Files:</h4>
                                        <ul className="space-y-2">
                                            {documents.map((file, index) => (
                                                <li key={index} className="flex items-center bg-gray-50 p-3 rounded">
                                                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                                                    <span className="text-sm text-gray-700">{file.name}</span>
                                                    <span className="text-xs text-gray-500 ml-auto">
                                                        {(file.size / 1024).toFixed(2)} KB
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading || documents.length === 0}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {uploading ? 'Uploading...' : 'Continue to Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {step === 3 && (
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="flex items-center mb-6">
                                <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                                <h2 className="text-2xl font-bold">Complete Payment</h2>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <h3 className="font-semibold mb-4">Order Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service</span>
                                        <span className="font-medium">{service.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Processing Time</span>
                                        <span className="font-medium">{service.estimatedDays}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Documents Uploaded</span>
                                        <span className="font-medium">{documents.length} files</span>
                                    </div>
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between text-lg">
                                            <span className="font-semibold">Total Amount</span>
                                            <span className="font-bold text-blue-600">₹{service.price.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <PaymentButton
                                amount={service.price}
                                orderId={orderId}
                                orderNumber={orderNumber}
                                customerName={user?.name || ''}
                                customerEmail={user?.email || ''}
                                serviceName={service.name}
                                onSuccess={handlePaymentSuccess}
                            />

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setStep(2)}
                                    className="text-gray-600 hover:text-gray-800 text-sm"
                                >
                                    ← Back to Documents
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && (
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="text-center mb-8">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                                <p className="text-gray-600">
                                    Your order has been confirmed and payment received.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Service</p>
                                        <p className="font-semibold">{service.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Amount Paid</p>
                                        <p className="font-semibold text-green-600">₹{service.price.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-semibold text-blue-600">Payment Received</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Processing Time</p>
                                        <p className="font-semibold">{service.estimatedDays}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-900">
                                    <strong>What's Next?</strong> Our team will start processing your application.
                                    You'll receive updates via email and can track progress in your dashboard.
                                </p>
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={handleConfirm}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div>Loading...</div></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
