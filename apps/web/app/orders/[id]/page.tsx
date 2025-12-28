'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage, account } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query } from 'appwrite';
import Link from 'next/link';
import {
    ArrowLeft,
    CreditCard,
    FileText,
    Download,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Package,
    Upload,
    ChevronRight,
    Receipt,
    Award,
    Phone,
    Mail,
    FileQuestion,
    IndianRupee
} from 'lucide-react';
import FloatingChatButton from '@/components/chat/FloatingChatButton';
import DocumentReupload from '@/components/customer/DocumentReupload';
import DocumentUploadSection from '@/components/customer/DocumentUploadSection';
import PaymentButton from '@/components/PaymentButton';
import CustomerDashboardLayout from '@/components/customer/CustomerDashboardLayout';
import { QuestionnaireForm } from '@/components/customer/QuestionnaireForm';
import GovFeeCard from '@/components/customer/GovFeeCard';
import { getServiceBySlug } from '@/data/services';

interface OrderDetailProps {
    params: {
        id: string;
    };
}

// Progress step configuration
const ORDER_STEPS = [
    { key: 'payment', label: 'Payment', icon: CreditCard },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'review', label: 'Review', icon: Clock },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'completed', label: 'Completed', icon: Award },
];

export default function OrderDetailPage({ params }: OrderDetailProps) {
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [service, setService] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [questionnaires, setQuestionnaires] = useState<any[]>([]);
    const [govFeeRequests, setGovFeeRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [reuploadingDoc, setReuploadingDoc] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'documents' | 'timeline' | 'deliverables' | 'questionnaires'>('documents');
    const [showQuestionnaire, setShowQuestionnaire] = useState<any>(null);

    useEffect(() => {
        checkAuthAndLoadOrder();
    }, [params.id]);

    const handlePaymentSuccess = () => {
        if (user) {
            loadOrderDetails(user.$id);
        }
    };

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
            const orderDoc = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                params.id
            );

            if (orderDoc.customerId !== userId) {
                router.push('/dashboard');
                return;
            }

            if (typeof orderDoc.formData === 'string') {
                orderDoc.formData = JSON.parse(orderDoc.formData);
            }

            setOrder(orderDoc);

            // Load service
            let serviceData = null;
            try {
                serviceData = await databases.getDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.services,
                    orderDoc.serviceId
                );
            } catch (serviceError) {
                const staticService = getServiceBySlug(orderDoc.serviceId);
                if (staticService) {
                    const docsRequired = staticService.documents?.groups?.[0]?.items || [];
                    serviceData = {
                        $id: staticService.slug,
                        name: staticService.title,
                        shortDescription: staticService.hero?.description || '',
                        description: staticService.overview?.description || '',
                        category: staticService.category,
                        estimatedDays: staticService.timeline,
                        price: staticService.basePrice,
                        documentRequired: docsRequired,
                    };
                }
            }
            setService(serviceData);

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
                [Query.equal('orderId', params.id), Query.orderDesc('$createdAt')]
            );
            setTimeline(timelineResponse.documents);

            // Load certificates
            await loadCertificates();

            // Load questionnaires
            await loadQuestionnaires();

            // Load government fee requests
            await loadGovFeeRequests();
        } catch (error) {
            console.error('Failed to load order details:', error);
        }
    };

    const loadCertificates = async () => {
        try {
            const response = await fetch(`/api/certificates?orderId=${params.id}`);
            const data = await response.json();
            if (data.success) {
                setCertificates(data.certificates);
            }
        } catch (error) {
            console.error('Failed to load certificates:', error);
        }
    };

    const loadQuestionnaires = async () => {
        try {
            const response = await fetch(`/api/questionnaires/${params.id}`);
            const data = await response.json();
            if (data.success) {
                setQuestionnaires(data.questionnaires);
                // Auto-switch to questionnaires tab if there are pending ones
                const pendingQ = data.questionnaires.find((q: any) => q.status === 'pending');
                if (pendingQ) {
                    setActiveTab('questionnaires');
                }
            }
        } catch (error) {
            console.error('Failed to load questionnaires:', error);
        }
    };

    const loadGovFeeRequests = async () => {
        try {
            const response = await fetch(`/api/admin/orders/request-gov-fee?orderId=${params.id}`);
            const data = await response.json();
            if (data.success) {
                setGovFeeRequests(data.feeRequests || []);
            }
        } catch (error) {
            console.error('Failed to load gov fee requests:', error);
        }
    };

    const handleQuestionnaireSubmitted = () => {
        loadQuestionnaires();
        setShowQuestionnaire(null);
    };

    // Calculate current step based on order status
    const getCurrentStep = () => {
        if (!order) return 0;
        if (order.paymentStatus !== 'paid') return 0;
        if (order.status === 'pending_docs' || documents.length === 0) return 1;
        if (order.status === 'in_review') return 2;
        if (['ready_for_filing', 'submitted', 'pending_approval'].includes(order.status)) return 3;
        if (order.status === 'completed') return 4;
        return 2; // Default to review stage
    };

    // Get action needed message and button
    const getActionNeeded = () => {
        if (!order) return null;

        if (order.paymentStatus !== 'paid') {
            return {
                type: 'warning',
                message: 'Complete payment to proceed with your order',
                action: 'payment'
            };
        }

        // Check for pending government fees
        const pendingGovFees = govFeeRequests.filter(req => req.status === 'pending');
        if (pendingGovFees.length > 0) {
            const totalPending = pendingGovFees.reduce((sum, req) => sum + req.totalAmount, 0);
            return {
                type: 'warning',
                message: `Government fee payment of ₹${totalPending.toLocaleString('en-IN')} required to proceed`,
                action: 'govfee'
            };
        }

        if (order.status === 'pending_docs' || (order.paymentStatus === 'paid' && documents.length === 0)) {
            return {
                type: 'warning',
                message: 'Upload required documents to proceed',
                action: 'upload'
            };
        }

        const rejectedDocs = documents.filter(d => d.status === 'rejected');
        if (rejectedDocs.length > 0) {
            return {
                type: 'error',
                message: `${rejectedDocs.length} document(s) need to be re-uploaded`,
                action: 'reupload'
            };
        }

        return null;
    };

    const handleDownloadDocument = async (fileId: string, fileName: string) => {
        try {
            const result = storage.getFileDownload(appwriteConfig.buckets.customerDocuments, fileId);
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

    const handleDownloadInvoice = () => {
        if (order?.invoiceFileId) {
            const link = document.createElement('a');
            link.href = `/api/invoices/download/${order.invoiceFileId}`;
            link.download = `invoice-${order.invoiceNumber || order.orderNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(dateString));
    };

    const formatDateTime = (dateString: string) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    const currentStep = getCurrentStep();
    const actionNeeded = getActionNeeded();
    const verifiedDocs = documents.filter(d => d.status === 'verified').length;
    const pendingDocs = documents.filter(d => d.status === 'pending').length;
    const rejectedDocs = documents.filter(d => d.status === 'rejected').length;

    if (loading) {
        return (
            <CustomerDashboardLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-neutral-600">Loading order details...</p>
                    </div>
                </div>
            </CustomerDashboardLayout>
        );
    }

    if (!order) {
        return (
            <CustomerDashboardLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Order Not Found</h1>
                        <p className="text-neutral-600 mb-6">The order you're looking for doesn't exist.</p>
                        <Link href="/dashboard" className="text-brand-600 hover:underline">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </CustomerDashboardLayout>
        );
    }

    return (
        <CustomerDashboardLayout>
            <div className="p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                            <ArrowLeft className="h-5 w-5 text-neutral-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">Order #{order.orderNumber}</h1>
                            <p className="text-sm text-neutral-500">Placed on {formatDate(order.$createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.open(`mailto:support@lawethic.com?subject=Order ${order.orderNumber}`, '_blank')}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Email Support"
                        >
                            <Mail className="h-5 w-5 text-neutral-600" />
                        </button>
                        <button
                            onClick={() => window.open('tel:+911234567890', '_blank')}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Call Support"
                        >
                            <Phone className="h-5 w-5 text-neutral-600" />
                        </button>
                    </div>
                </div>

                {/* Progress Tracker */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
                    <div className="flex items-center justify-between relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-neutral-200 -z-0" />
                        <div
                            className="absolute top-5 left-0 h-0.5 bg-brand-600 -z-0 transition-all duration-500"
                            style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
                        />

                        {ORDER_STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = index < currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <div key={step.key} className="flex flex-col items-center z-10">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center transition-all
                                        ${isCompleted ? 'bg-brand-600 text-white' :
                                            isCurrent ? 'bg-brand-100 text-brand-600 border-2 border-brand-600' :
                                                'bg-neutral-100 text-neutral-400'}
                                    `}>
                                        {isCompleted ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            <Icon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${isCompleted || isCurrent ? 'text-neutral-900' : 'text-neutral-400'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Needed Banner */}
                {actionNeeded && (
                    <div className={`rounded-xl p-4 mb-6 flex items-center justify-between ${actionNeeded.type === 'error' ? 'bg-red-50 border border-red-200' :
                        'bg-amber-50 border border-amber-200'
                        }`}>
                        <div className="flex items-center gap-3">
                            <AlertCircle className={`h-5 w-5 ${actionNeeded.type === 'error' ? 'text-red-600' : 'text-amber-600'
                                }`} />
                            <span className={`font-medium ${actionNeeded.type === 'error' ? 'text-red-900' : 'text-amber-900'
                                }`}>
                                {actionNeeded.message}
                            </span>
                        </div>
                        {actionNeeded.action === 'upload' && (
                            <button
                                onClick={() => setActiveTab('documents')}
                                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                            >
                                Upload Documents
                            </button>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service Card */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Package className="h-6 w-6 text-brand-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-semibold text-neutral-900">{service?.name || 'Service'}</h2>
                                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                                        {service?.shortDescription || service?.description}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3 text-sm">
                                        <span className="text-neutral-500">
                                            <span className="font-medium text-neutral-900">{service?.category}</span>
                                        </span>
                                        <span className="text-neutral-300">•</span>
                                        <span className="text-neutral-500">
                                            Est. <span className="font-medium text-neutral-900">{service?.estimatedDays || 'N/A'}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                            <div className="flex border-b border-neutral-200 overflow-x-auto">
                                {[
                                    { key: 'documents', label: 'Documents', count: documents.length },
                                    { key: 'questionnaires', label: 'Questionnaires', count: questionnaires.filter(q => q.status === 'pending').length, highlight: questionnaires.some(q => q.status === 'pending') },
                                    { key: 'deliverables', label: 'Deliverables', count: certificates.length + (order.invoiceFileId ? 1 : 0) },
                                    { key: 'timeline', label: 'Timeline', count: timeline.length }
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key as any)}
                                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.key
                                            ? 'text-brand-600 bg-brand-50'
                                            : tab.highlight
                                                ? 'text-amber-600 bg-amber-50'
                                                : 'text-neutral-600 hover:bg-neutral-50'
                                            }`}
                                    >
                                        {tab.label}
                                        {tab.count > 0 && (
                                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key
                                                ? 'bg-brand-100 text-brand-700'
                                                : tab.highlight
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-neutral-100 text-neutral-600'
                                                }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                        {activeTab === tab.key && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6">
                                {/* Documents Tab */}
                                {activeTab === 'documents' && (
                                    <div className="space-y-4">
                                        {/* Document Stats */}
                                        {documents.length > 0 && (
                                            <div className="flex items-center gap-4 pb-4 border-b border-neutral-100">
                                                <span className="text-sm text-neutral-500">
                                                    <span className="font-medium text-green-600">{verifiedDocs}</span> verified
                                                </span>
                                                <span className="text-sm text-neutral-500">
                                                    <span className="font-medium text-amber-600">{pendingDocs}</span> pending
                                                </span>
                                                {rejectedDocs > 0 && (
                                                    <span className="text-sm text-neutral-500">
                                                        <span className="font-medium text-red-600">{rejectedDocs}</span> rejected
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Upload Section */}
                                        {order.paymentStatus === 'paid' && service?.documentRequired?.length > 0 && (
                                            <DocumentUploadSection
                                                orderId={params.id}
                                                orderStatus={order.status}
                                                documentRequired={service.documentRequired}
                                                existingDocuments={documents}
                                                onUploadSuccess={() => loadOrderDetails(user.$id)}
                                                userId={user.$id}
                                            />
                                        )}

                                        {/* Document List */}
                                        {documents.length > 0 ? (
                                            <div className="space-y-3">
                                                {documents.map((doc) => (
                                                    <div key={doc.$id} className="border border-neutral-200 rounded-lg overflow-hidden">
                                                        <div className="flex items-center justify-between p-4">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <FileText className="h-8 w-8 text-neutral-400 flex-shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="font-medium text-neutral-900 truncate">
                                                                        {doc.fileName || doc.name || 'Document'}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                                                                            doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                                'bg-amber-100 text-amber-700'
                                                                            }`}>
                                                                            {doc.status === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                                            {doc.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                                                            {doc.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                                                            {doc.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleDownloadDocument(doc.fileId, doc.fileName)}
                                                                    className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </button>
                                                                {doc.status === 'rejected' && (
                                                                    <button
                                                                        onClick={() => setReuploadingDoc(doc)}
                                                                        className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 transition-colors"
                                                                    >
                                                                        Re-upload
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {doc.status === 'rejected' && doc.rejectionReason && (
                                                            <div className="bg-red-50 border-t border-red-100 px-4 py-3">
                                                                <p className="text-sm text-red-700">
                                                                    <span className="font-medium">Reason:</span> {doc.rejectionReason}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : order.paymentStatus !== 'paid' ? (
                                            <div className="text-center py-8 text-neutral-500">
                                                <FileText className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                                                <p>Complete payment to upload documents</p>
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {/* Deliverables Tab */}
                                {activeTab === 'deliverables' && (
                                    <div className="space-y-3">
                                        {/* Invoice */}
                                        <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Receipt className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900">Invoice</p>
                                                    <p className="text-sm text-neutral-500">{order.invoiceNumber || 'Payment receipt'}</p>
                                                </div>
                                            </div>
                                            {order.invoiceFileId ? (
                                                <button
                                                    onClick={handleDownloadInvoice}
                                                    className="flex items-center gap-2 px-3 py-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </button>
                                            ) : (
                                                <span className="text-sm text-neutral-400">Pending</span>
                                            )}
                                        </div>

                                        {/* Certificates */}
                                        {certificates.length > 0 ? (
                                            certificates.map((cert) => (
                                                <div key={cert.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                                                            <Award className="h-5 w-5 text-brand-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-neutral-900">{cert.documentName}</p>
                                                            <p className="text-sm text-neutral-500">
                                                                {formatDate(cert.uploadedAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={cert.downloadUrl}
                                                        className="flex items-center gap-2 px-3 py-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors text-sm font-medium"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        Download
                                                    </a>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex items-center justify-between p-4 border border-dashed border-neutral-200 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                                                        <Award className="h-5 w-5 text-neutral-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-neutral-600">Certificate</p>
                                                        <p className="text-sm text-neutral-400">Will be available after completion</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-neutral-400">Pending</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Questionnaires Tab */}
                                {activeTab === 'questionnaires' && (
                                    <div>
                                        {showQuestionnaire ? (
                                            <div>
                                                <button
                                                    onClick={() => setShowQuestionnaire(null)}
                                                    className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 mb-4"
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                    Back to questionnaires
                                                </button>
                                                <QuestionnaireForm
                                                    questionnaireId={showQuestionnaire.$id}
                                                    template={showQuestionnaire.template}
                                                    userId={user.$id}
                                                    userName={user.name || user.email}
                                                    onSubmitSuccess={handleQuestionnaireSubmitted}
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {questionnaires.length > 0 ? (
                                                    questionnaires.map((q) => (
                                                        <div
                                                            key={q.$id}
                                                            className={`border rounded-lg p-4 ${q.status === 'pending'
                                                                ? 'border-amber-200 bg-amber-50'
                                                                : 'border-blue-200 bg-blue-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <h4 className="font-medium text-neutral-900">
                                                                        {q.templateName}
                                                                    </h4>
                                                                    <p className="text-sm text-neutral-600 mt-1">
                                                                        {q.templateDescription}
                                                                    </p>
                                                                    {q.notes && (
                                                                        <p className="text-sm text-neutral-500 mt-2 italic">
                                                                            Note from team: {q.notes}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${q.status === 'pending'
                                                                    ? 'bg-amber-100 text-amber-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                                    }`}>
                                                                    {q.status === 'pending' ? 'Action Required' : 'Submitted'}
                                                                </span>
                                                            </div>

                                                            {q.status === 'pending' && q.template ? (
                                                                <button
                                                                    onClick={() => setShowQuestionnaire(q)}
                                                                    className="mt-4 w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                                                                >
                                                                    Fill Questionnaire
                                                                </button>
                                                            ) : q.submittedAt && (
                                                                <p className="text-sm text-blue-600 mt-4">
                                                                    ✓ Submitted on {formatDateTime(q.submittedAt)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-neutral-500">
                                                        <FileQuestion className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                                                        <p>No questionnaires required</p>
                                                        <p className="text-sm mt-1">
                                                            If our team needs additional information, questionnaires will appear here.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Timeline Tab */}
                                {activeTab === 'timeline' && (
                                    <div>
                                        {timeline.length > 0 ? (
                                            <div className="space-y-4">
                                                {timeline.map((entry, index) => (
                                                    <div key={entry.$id} className="flex gap-4">
                                                        <div className="flex flex-col items-center">
                                                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-brand-600' : 'bg-neutral-300'
                                                                }`} />
                                                            {index < timeline.length - 1 && (
                                                                <div className="w-0.5 flex-1 bg-neutral-200 my-1" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 pb-4">
                                                            <p className="text-sm text-neutral-500">{formatDateTime(entry.$createdAt)}</p>
                                                            <p className="font-medium text-neutral-900 capitalize mt-0.5">
                                                                {entry.action?.replace(/_/g, ' ')}
                                                            </p>
                                                            {entry.details && (
                                                                <p className="text-sm text-neutral-600 mt-1">{entry.details}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-neutral-500">
                                                <Clock className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                                                <p>No activity recorded yet</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pending Government Fee - Show prominently if pending */}
                        {govFeeRequests.filter(req => req.status === 'pending').map((req) => (
                            <GovFeeCard
                                key={req.$id}
                                feeRequest={req}
                                customerId={user?.$id || order?.customerId}
                                customerName={user?.name || order?.formData?.fullName || 'Customer'}
                                customerEmail={user?.email || order?.formData?.email || ''}
                                customerPhone={order?.formData?.phone || order?.formData?.mobile}
                                onPaymentSuccess={() => {
                                    loadGovFeeRequests();
                                    loadOrderDetails(user.$id);
                                }}
                            />
                        ))}

                        {/* Order Summary Card */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <h3 className="font-semibold text-neutral-900 mb-4">Order Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-neutral-500">Status</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        order.status === 'on_hold' ? 'bg-red-100 text-red-700' :
                                            'bg-brand-100 text-brand-700'
                                        }`}>
                                        {order.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-neutral-500">Payment</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                        'bg-amber-100 text-amber-700'
                                        }`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-neutral-500">Amount</span>
                                    <span className="font-semibold text-neutral-900">
                                        ₹{order.amount?.toLocaleString('en-IN') || '0'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-neutral-500">Date</span>
                                    <span className="text-sm text-neutral-900">{formatDate(order.$createdAt)}</span>
                                </div>
                            </div>

                            {/* Payment Button if not paid */}
                            {order.paymentStatus !== 'paid' && service && user && (
                                <div className="mt-4 pt-4 border-t border-neutral-100">
                                    <PaymentButton
                                        amount={order.amount}
                                        orderId={order.$id}
                                        orderNumber={order.orderNumber}
                                        customerName={user.name || order.formData?.fullName || 'Customer'}
                                        customerEmail={user.email || order.formData?.email || ''}
                                        serviceName={service.name}
                                        onSuccess={handlePaymentSuccess}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <h3 className="font-semibold text-neutral-900 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                {order.invoiceFileId && (
                                    <button
                                        onClick={handleDownloadInvoice}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 rounded-lg transition-colors group"
                                    >
                                        <Receipt className="h-5 w-5 text-neutral-400 group-hover:text-brand-600" />
                                        <span className="text-sm font-medium text-neutral-700">Download Invoice</span>
                                        <ChevronRight className="h-4 w-4 text-neutral-300 ml-auto" />
                                    </button>
                                )}
                                <a
                                    href="mailto:support@lawethic.com"
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 rounded-lg transition-colors group"
                                >
                                    <Mail className="h-5 w-5 text-neutral-400 group-hover:text-brand-600" />
                                    <span className="text-sm font-medium text-neutral-700">Email Support</span>
                                    <ChevronRight className="h-4 w-4 text-neutral-300 ml-auto" />
                                </a>
                                <a
                                    href="tel:+911234567890"
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 rounded-lg transition-colors group"
                                >
                                    <Phone className="h-5 w-5 text-neutral-400 group-hover:text-brand-600" />
                                    <span className="text-sm font-medium text-neutral-700">Call Support</span>
                                    <ChevronRight className="h-4 w-4 text-neutral-300 ml-auto" />
                                </a>
                            </div>
                        </div>

                        {/* Certificates Ready Banner */}
                        {certificates.length > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <Award className="h-6 w-6 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-900">Certificate Ready!</p>
                                        <p className="text-sm text-green-700">Your certificate is available for download</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Paid Government Fees */}
                        {govFeeRequests.filter(req => req.status === 'paid').length > 0 && (
                            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                                    <IndianRupee className="h-4 w-4" />
                                    Paid Government Fees
                                </h3>
                                <div className="space-y-3">
                                    {govFeeRequests.filter(req => req.status === 'paid').map((req) => (
                                        <div
                                            key={req.$id}
                                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-green-900">
                                                    ₹{req.totalAmount.toLocaleString('en-IN')}
                                                </p>
                                                <p className="text-xs text-green-600">
                                                    Paid on {new Date(req.paidAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Chat Button */}
                {order && (
                    <FloatingChatButton
                        orderId={order.$id}
                        orderNumber={order.orderNumber || order.$id}
                    />
                )}

                {/* Document Re-upload Modal */}
                {reuploadingDoc && (
                    <DocumentReupload
                        documentId={reuploadingDoc.$id}
                        documentName={reuploadingDoc.fileName || reuploadingDoc.name || 'Document'}
                        orderId={params.id}
                        rejectionReason={reuploadingDoc.rejectionReason || 'No reason provided'}
                        onSuccess={() => {
                            setReuploadingDoc(null);
                            loadOrderDetails(user.$id);
                            alert('Document re-uploaded successfully!');
                        }}
                        onClose={() => setReuploadingDoc(null)}
                    />
                )}
            </div>
        </CustomerDashboardLayout>
    );
}
