'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage, account } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query } from 'appwrite';
import Link from 'next/link';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    FileText,
    Download,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Package,
    MessageCircle,
    HelpCircle,
    Mail,
    Phone
} from 'lucide-react';
import FloatingChatButton from '@/components/chat/FloatingChatButton';

interface OrderDetailProps {
    params: {
        id: string;
    };
}

export default function OrderDetailPage({ params }: OrderDetailProps) {
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [service, setService] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkAuthAndLoadOrder();
    }, [params.id]);

    const checkAuthAndLoadOrder = async () => {
        try {
            const userData = await account.get();
            setUser(userData);
            await loadOrderDetails(userData.$id);
        } catch (error) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const loadOrderDetails = async (userId: string) => {
        try {
            // Load order
            const orderDoc = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                params.id
            );

            // Verify this order belongs to the logged-in user
            if (orderDoc.customerId !== userId) {
                router.push('/dashboard');
                return;
            }

            // Parse formData if it's a string
            if (typeof orderDoc.formData === 'string') {
                orderDoc.formData = JSON.parse(orderDoc.formData);
            }

            setOrder(orderDoc);

            // Load service
            const serviceDoc = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.services,
                orderDoc.serviceId
            );
            setService(serviceDoc);

            // Load documents
            const docsResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.documents,
                [Query.equal('orderId', params.id)]
            );
            setDocuments(docsResponse.documents);

            // Load timeline
            const timelineResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orderTimeline,
                [
                    Query.equal('orderId', params.id),
                    Query.orderDesc('$createdAt')
                ]
            );
            setTimeline(timelineResponse.documents);

            // Load certificates
            await loadCertificates();

        } catch (error) {
            console.error('Failed to load order details:', error);
        }
    };

    const loadCertificates = async () => {
        try {
            const response = await fetch(`/api/certificates?orderId=${params.id}`);
            const data = await response.json();

            if (!response.ok) {
                console.error('[Customer] Certificate API error:', response.status, data);
                return;
            }

            if (data.success) {
                setCertificates(data.certificates);
                console.log('[Customer] Loaded certificates:', data.certificates.length);
            }
        } catch (error) {
            console.error('[Customer] Failed to load certificates:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'processing':
            case 'paid':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'new':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'cancelled':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5" />;
            case 'processing':
            case 'paid':
                return <Clock className="h-5 w-5" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5" />;
            default:
                return <AlertCircle className="h-5 w-5" />;
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'failed':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getDocumentStatusColor = (status: string) => {
        switch (status) {
            case 'verified':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'rejected':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const handleDownloadDocument = async (fileId: string, fileName: string) => {
        try {
            const result = storage.getFileDownload(
                appwriteConfig.buckets.customerDocuments,
                fileId
            );

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = result.toString();
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download document');
        }
    };

    const handleDownloadInvoice = async () => {
        if (order?.invoiceFileId) {
            try {
                // Use API route to download invoice (handles authentication and permissions)
                const link = document.createElement('a');
                link.href = `/api/invoices/download/${order.invoiceFileId}`;
                link.download = `invoice-${order.invoiceNumber || order.orderNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Invoice download failed:', error);
                alert('Failed to download invoice');
            }
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                    <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                                <p className="text-sm text-gray-500">Placed on {formatDate(order.$createdAt)}</p>
                            </div>
                        </div>
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="font-semibold capitalize">{order.status}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <Package className="h-12 w-12 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{service?.name || 'Service'}</h2>
                                    <p className="text-gray-600 mb-4">{service?.shortDescription || service?.description || 'No description available'}</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Category</p>
                                            <p className="font-medium text-gray-900">{service?.category || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Processing Time</p>
                                            <p className="font-medium text-gray-900">{service?.deliveryTime ? `${service.deliveryTime} days` : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <CreditCard className="h-5 w-5 text-gray-600" />
                                <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount</span>
                                    <span className="font-semibold text-gray-900">₹{order.amount?.toLocaleString('en-IN') || '0'}</span>
                                </div>
                                {order.razorpayOrderId && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction ID</span>
                                        <span className="text-sm text-gray-900 font-mono">{order.razorpayOrderId}</span>
                                    </div>
                                )}
                                {order.paymentStatus === 'pending' && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                            Complete Payment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <FileText className="h-5 w-5 text-gray-600" />
                                <h3 className="text-lg font-bold text-gray-900">Uploaded Documents</h3>
                            </div>
                            {documents.length > 0 ? (
                                <div className="space-y-3">
                                    {documents.map((doc) => (
                                        <div key={doc.$id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-8 w-8 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{doc.name || doc.documentType || 'Document'}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getDocumentStatusColor(doc.verificationStatus)}`}>
                                                            {doc.verificationStatus}
                                                        </span>
                                                        {doc.verificationStatus === 'rejected' && doc.rejectionReason && (
                                                            <span className="text-xs text-red-600">
                                                                ({doc.rejectionReason})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownloadDocument(doc.fileId, `${doc.documentType}.pdf`)}
                                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                            >
                                                <Download className="h-4 w-4" />
                                                <span className="text-sm font-medium">Download</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p>No documents uploaded yet</p>
                                </div>
                            )}
                        </div>

                        {/* Deliverables Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Download className="h-5 w-5 text-gray-600" />
                                <h3 className="text-lg font-bold text-gray-900">Deliverables</h3>
                            </div>
                            <div className="space-y-3">
                                {/* Invoice */}
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-8 w-8 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">Invoice</p>
                                            <p className="text-sm text-gray-500">
                                                {order.invoiceNumber || 'Payment receipt and details'}
                                            </p>
                                        </div>
                                    </div>
                                    {order.invoiceFileId ? (
                                        <button
                                            onClick={handleDownloadInvoice}
                                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span className="text-sm font-medium">Download</span>
                                        </button>
                                    ) : (
                                        <span className="text-sm text-gray-500">Pending</span>
                                    )}
                                </div>

                                {/* Certificates - Dynamic list */}
                                {certificates.length > 0 ? (
                                    certificates.map((cert) => (
                                        <div key={cert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-8 w-8 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{cert.documentName}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {cert.documentType.replace(/_/g, ' ')} • {new Date(cert.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={cert.downloadUrl}
                                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                            >
                                                <Download className="h-4 w-4" />
                                                <span className="text-sm font-medium">Download</span>
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="h-8 w-8 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-gray-900">Certificate</p>
                                                <p className="text-sm text-gray-500">Registration/completion certificate</p>
                                            </div>
                                        </div>
                                        {order.status === 'completed' ? (
                                            <span className="text-sm text-yellow-600">Processing</span>
                                        ) : (
                                            <span className="text-sm text-gray-500">Pending</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Clock className="h-5 w-5 text-gray-600" />
                                <h3 className="text-lg font-bold text-gray-900">Order Timeline</h3>
                            </div>
                            {timeline.length > 0 ? (
                                <div className="space-y-4">
                                    {timeline.map((entry, index) => (
                                        <div key={entry.$id} className="flex space-x-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                                {index < timeline.length - 1 && (
                                                    <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <p className="text-sm text-gray-500 mb-1">{formatDate(entry.$createdAt)}</p>
                                                <p className="font-medium text-gray-900 capitalize">{entry.action?.replace(/_/g, ' ')}</p>
                                                {entry.details && (
                                                    <p className="text-sm text-gray-600 mt-1">{entry.details}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p>No activity recorded yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Information</h3>
                            <div className="space-y-3">
                                {order.formData?.fullName && (
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{order.formData.fullName}</p>
                                    </div>
                                )}
                                {order.formData?.email && (
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{order.formData.email}</p>
                                    </div>
                                )}
                                {order.formData?.phone && (
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{order.formData.phone}</p>
                                    </div>
                                )}
                                {order.formData?.businessName && (
                                    <div>
                                        <p className="text-sm text-gray-500">Business Name</p>
                                        <p className="font-medium text-gray-900">{order.formData.businessName}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <MessageCircle className="h-5 w-5 text-gray-600" />
                                    <span className="font-medium text-gray-900">Chat with Support</span>
                                </button>
                                <a href="mailto:support@lawethic.com" className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Mail className="h-5 w-5 text-gray-600" />
                                    <span className="font-medium text-gray-900">Email Support</span>
                                </a>
                                <a href="tel:+911234567890" className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Phone className="h-5 w-5 text-gray-600" />
                                    <span className="font-medium text-gray-900">Call Support</span>
                                </a>
                            </div>
                        </div>

                        {/* Help Resources */}
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                            <div className="flex items-start space-x-3">
                                <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-blue-900 mb-2">Common Questions</h4>
                                    <ul className="space-y-2 text-sm text-blue-800">
                                        <li>• Documents typically verified within 24 hours</li>
                                        <li>• You'll receive email updates for all status changes</li>
                                        <li>• Certificates delivered within 7-10 business days</li>
                                        <li>• Contact support for urgent requests</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Chat Button */}
            {order && (
                <FloatingChatButton
                    orderId={order.$id}
                    orderNumber={order.orderNumber || order.$id}
                />
            )}
        </div>
    );
}
