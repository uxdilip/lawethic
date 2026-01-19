'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage, account } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query } from 'appwrite';


import Link from 'next/link';
import CertificateUpload, { CertificateList } from '@/components/admin/CertificateUpload';
import FloatingChatButton from '@/components/chat/FloatingChatButton';
import AssignmentDropdown from '@/components/admin/AssignmentDropdown';
import { SendQuestionnaireButton } from '@/components/admin/SendQuestionnaireButton';
import GovFeeRequestModal from '@/components/admin/GovFeeRequestModal';
import { getServiceBySlug } from '@/data/services';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Eye,
    Package,
    CreditCard,
    Calendar,
    Award,
    MessageSquare,
    History,
    AlertCircle,
    ExternalLink,
    Copy,
    FileQuestion,
    IndianRupee
} from 'lucide-react';

interface CaseDetailProps {
    params: {
        id: string;
    };
}

type TabType = 'overview' | 'documents' | 'timeline' | 'questionnaires';

export default function CaseDetailPage({ params }: CaseDetailProps) {
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [service, setService] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [questionnaires, setQuestionnaires] = useState<any[]>([]);
    const [govFeeRequests, setGovFeeRequests] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showCertificateUpload, setShowCertificateUpload] = useState(false);
    const [showGovFeeModal, setShowGovFeeModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusNote, setStatusNote] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    useEffect(() => {
        loadCaseDetails();
        loadCurrentUser();
    }, [params.id]);

    const loadCurrentUser = async () => {
        try {
            const user = await account.get();
            setCurrentUser(user);
        } catch (error) {
            console.error('Failed to load current user:', error);
        }
    };

    const loadCaseDetails = async () => {
        try {
            setLoading(true);

            const orderDoc = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                params.id
            );

            if (typeof orderDoc.formData === 'string') {
                orderDoc.formData = JSON.parse(orderDoc.formData);
            }

            setOrder(orderDoc);
            setSelectedStatus(orderDoc.status);

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
            console.error('Failed to load case details:', error);
        } finally {
            setLoading(false);
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

    const handleCertificateUploadSuccess = () => {
        setShowCertificateUpload(false);
        loadCertificates();
    };

    const handleQuestionnairesSent = () => {
        loadQuestionnaires();
        loadCaseDetails();
    };

    const handleGovFeeRequestSuccess = () => {
        loadGovFeeRequests();
        loadCaseDetails();
    };

    const handleStatusUpdate = async () => {
        if (!order || selectedStatus === order.status) return;

        try {
            setSaving(true);

            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                params.id,
                { status: selectedStatus }
            );

            if (statusNote.trim()) {
                await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.orderTimeline,
                    'unique()',
                    {
                        orderId: params.id,
                        action: 'status_change',
                        details: `Status changed to ${selectedStatus}. Note: ${statusNote}`,
                        performedBy: 'admin',
                    }
                );
            }

            // Send notification to customer
            try {
                await databases.createDocument(
                    appwriteConfig.databaseId,
                    'notifications',
                    'unique()',
                    {
                        userId: order.customerId,
                        orderId: params.id,
                        type: 'status_change',
                        message: `Your order status has been updated to ${selectedStatus}`,
                        title: 'Order Status Updated',
                        description: `Status changed to ${selectedStatus}${statusNote ? `. Note: ${statusNote}` : ''}`,
                        actionUrl: `/orders/${params.id}`,
                        actionLabel: 'View Order',
                        read: false,
                        readAt: null,
                        sourceUserId: null,
                        metadata: null
                    }
                );
            } catch (notifError) {
                console.error('Failed to send notification:', notifError);
            }

            alert('Status updated successfully!');
            setStatusNote('');
            await loadCaseDetails();
        } catch (error: any) {
            console.error('Failed to update status:', error);
            alert('Failed to update status: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDocumentAction = async (documentId: string, action: 'verify' | 'reject', reason?: string) => {
        try {
            const response = await fetch('/api/admin/documents/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId,
                    action,
                    reason,
                    orderId: params.id,
                    customerId: order?.customerId
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to process document action');
            }

            alert(`Document ${action === 'verify' ? 'verified' : 'rejected'} successfully!`);
            await loadCaseDetails();
        } catch (error: any) {
            console.error(`Failed to ${action} document:`, error);
            alert(`Failed to ${action} document: ` + error.message);
        }
    };

    const downloadDocument = async (fileId: string, fileName: string) => {
        try {
            const result = storage.getFileView(appwriteConfig.buckets.customerDocuments, fileId);
            window.open(result.href, '_blank');
        } catch (error) {
            console.error('Failed to download document:', error);
            alert('Failed to download document');
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            new: 'bg-blue-100 text-blue-700',
            pending_docs: 'bg-amber-100 text-amber-700',
            in_review: 'bg-purple-100 text-purple-700',
            ready_for_filing: 'bg-indigo-100 text-indigo-700',
            submitted: 'bg-cyan-100 text-cyan-700',
            pending_approval: 'bg-orange-100 text-orange-700',
            completed: 'bg-green-100 text-green-700',
            on_hold: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-neutral-100 text-neutral-700';
    };

    const getDocStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-700',
            verified: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-neutral-100 text-neutral-700';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Document stats
    const verifiedDocs = documents.filter(d => d.status === 'verified').length;
    const pendingDocs = documents.filter(d => d.status === 'pending').length;
    const rejectedDocs = documents.filter(d => d.status === 'rejected').length;

    if (loading) {
        return (
            <>
                
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                    </div>
                
            </>
        );
    }

    if (!order) {
        return (
            <>
                
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center py-12">
                            <AlertCircle className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-neutral-900">Order not found</h2>
                            <Link href="/admin/cases" className="text-brand-600 hover:underline mt-4 inline-block">
                                ← Back to Cases
                            </Link>
                        </div>
                    </div>
                
            </>
        );
    }

    return (
        <>
            
                <div className="max-w-7xl mx-auto px-6 py-6">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href="/admin/cases" className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 mb-3">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Cases
                        </Link>

                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-900">
                                    Order #{order.orderNumber}
                                </h1>
                                <p className="text-sm text-neutral-500 mt-1">
                                    Created {formatDateTime(order.$createdAt)}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <AssignmentDropdown
                                    orderId={order.$id}
                                    currentAssignment={order.assignedTo}
                                    onAssignmentChange={loadCaseDetails}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Badges Row */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                            Payment: {order.paymentStatus}
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-neutral-100 text-neutral-700">
                            Docs: {verifiedDocs}/{documents.length} verified
                        </span>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                                    <User className="h-6 w-6 text-brand-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900">
                                        {order.formData?.fullName || order.formData?.businessName || 'Customer'}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-neutral-600">
                                        {order.formData?.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-4 w-4" />
                                                {order.formData.email}
                                            </span>
                                        )}
                                        {(order.formData?.phone || order.formData?.mobile) && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-4 w-4" />
                                                {order.formData.phone || order.formData.mobile}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => copyToClipboard(order.customerId)}
                                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500"
                                    title="Copy Customer ID"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - Tabs */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                                {/* Tab Headers */}
                                <div className="flex border-b border-neutral-200 overflow-x-auto">
                                    {[
                                        { key: 'overview', label: 'Overview', icon: Package },
                                        { key: 'documents', label: 'Documents', icon: FileText, count: documents.length },
                                        { key: 'questionnaires', label: 'Questionnaires', icon: FileQuestion, count: questionnaires.length },
                                        { key: 'timeline', label: 'Timeline', icon: History, count: timeline.length }
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key as TabType)}
                                            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors relative ${activeTab === tab.key
                                                ? 'text-brand-600 bg-brand-50'
                                                : 'text-neutral-600 hover:bg-neutral-50'
                                                }`}
                                        >
                                            <tab.icon className="h-4 w-4" />
                                            {tab.label}
                                            {tab.count !== undefined && tab.count > 0 && (
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key
                                                    ? 'bg-brand-100 text-brand-700'
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

                                {/* Tab Content */}
                                <div className="p-6">
                                    {/* Overview Tab */}
                                    {activeTab === 'overview' && (
                                        <div className="space-y-6">
                                            {/* Service Details */}
                                            <div>
                                                <h4 className="text-sm font-medium text-neutral-500 mb-3">Service Details</h4>
                                                <div className="bg-neutral-50 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                                                            <Package className="h-5 w-5 text-brand-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h5 className="font-semibold text-neutral-900">{service?.name || 'N/A'}</h5>
                                                            <p className="text-sm text-neutral-600 mt-1">{service?.shortDescription}</p>
                                                            <div className="flex items-center gap-4 mt-2 text-sm">
                                                                <span className="text-neutral-500">
                                                                    Amount: <span className="font-semibold text-neutral-900">{formatCurrency(order.amount || 0)}</span>
                                                                </span>
                                                                <span className="text-neutral-500">
                                                                    Est. Days: <span className="font-medium text-neutral-900">{service?.estimatedDays || 'N/A'}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Onboarding Answers */}
                                            {order.formData?.onboardingAnswers && Object.keys(order.formData.onboardingAnswers).length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-neutral-500 mb-3">Onboarding Information</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {Object.entries(order.formData.onboardingAnswers).map(([key, value]: [string, any]) => (
                                                            <div key={key} className="bg-neutral-50 rounded-lg p-3">
                                                                <p className="text-xs text-neutral-500 mb-1">
                                                                    {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                                </p>
                                                                <p className="text-sm font-medium text-neutral-900">
                                                                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || 'N/A'}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Service Questions (Old Flow) */}
                                            {order.formData?.serviceQuestions && Object.keys(order.formData.serviceQuestions).length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-neutral-500 mb-3">Service-Specific Information</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {Object.entries(order.formData.serviceQuestions).map(([key, value]: [string, any]) => (
                                                            <div key={key} className="bg-neutral-50 rounded-lg p-3">
                                                                <p className="text-xs text-neutral-500 mb-1">
                                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                                </p>
                                                                <p className="text-sm font-medium text-neutral-900">
                                                                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || 'N/A'}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional Customer Info */}
                                            <div>
                                                <h4 className="text-sm font-medium text-neutral-500 mb-3">Additional Details</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {order.formData?.businessName && (
                                                        <div className="bg-neutral-50 rounded-lg p-3">
                                                            <p className="text-xs text-neutral-500 mb-1">Business Name</p>
                                                            <p className="text-sm font-medium text-neutral-900">{order.formData.businessName}</p>
                                                        </div>
                                                    )}
                                                    {order.formData?.panNumber && (
                                                        <div className="bg-neutral-50 rounded-lg p-3">
                                                            <p className="text-xs text-neutral-500 mb-1">PAN Number</p>
                                                            <p className="text-sm font-medium text-neutral-900">{order.formData.panNumber}</p>
                                                        </div>
                                                    )}
                                                    {order.formData?.address && (
                                                        <div className="bg-neutral-50 rounded-lg p-3 col-span-2">
                                                            <p className="text-xs text-neutral-500 mb-1">Address</p>
                                                            <p className="text-sm font-medium text-neutral-900">{order.formData.address}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Documents Tab */}
                                    {activeTab === 'documents' && (
                                        <div className="space-y-4">
                                            {/* Document Stats */}
                                            <div className="flex items-center gap-4 pb-4 border-b border-neutral-100">
                                                <span className="text-sm">
                                                    <span className="font-medium text-green-600">{verifiedDocs}</span>
                                                    <span className="text-neutral-500"> verified</span>
                                                </span>
                                                <span className="text-sm">
                                                    <span className="font-medium text-amber-600">{pendingDocs}</span>
                                                    <span className="text-neutral-500"> pending</span>
                                                </span>
                                                {rejectedDocs > 0 && (
                                                    <span className="text-sm">
                                                        <span className="font-medium text-red-600">{rejectedDocs}</span>
                                                        <span className="text-neutral-500"> rejected</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Document List */}
                                            {documents.length > 0 ? (
                                                <div className="space-y-3">
                                                    {documents.map((doc) => (
                                                        <div key={doc.$id} className="border border-neutral-200 rounded-lg p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-start gap-3">
                                                                    <FileText className="h-8 w-8 text-neutral-400 flex-shrink-0" />
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="font-medium text-neutral-900">{doc.fileName}</p>
                                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDocStatusColor(doc.status)}`}>
                                                                                {doc.status}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm text-neutral-500 mt-1">
                                                                            Uploaded {formatDateTime(doc.$createdAt)}
                                                                        </p>
                                                                        {doc.rejectionReason && (
                                                                            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                                                                <AlertCircle className="h-4 w-4" />
                                                                                {doc.rejectionReason}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => downloadDocument(doc.fileId, doc.fileName)}
                                                                        className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                                                        title="View Document"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </button>
                                                                    {doc.status === 'pending' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleDocumentAction(doc.$id, 'verify')}
                                                                                className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                                                                title="Verify"
                                                                            >
                                                                                <CheckCircle className="h-4 w-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const reason = prompt('Reason for rejection:');
                                                                                    if (reason) {
                                                                                        handleDocumentAction(doc.$id, 'reject', reason);
                                                                                    }
                                                                                }}
                                                                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                                                title="Reject"
                                                                            >
                                                                                <XCircle className="h-4 w-4" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 text-neutral-500">
                                                    <FileText className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                                                    <p>No documents uploaded yet</p>
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
                                                <div className="text-center py-12 text-neutral-500">
                                                    <Clock className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                                                    <p>No activity recorded yet</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Questionnaires Tab */}
                                    {activeTab === 'questionnaires' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-sm text-neutral-500">
                                                    Send questionnaires to collect additional information from the client
                                                </p>
                                                {currentUser && (
                                                    <SendQuestionnaireButton
                                                        orderId={params.id}
                                                        serviceSlug={order?.serviceId}
                                                        userId={currentUser.$id}
                                                        userName={currentUser.name || currentUser.email}
                                                        onSent={handleQuestionnairesSent}
                                                    />
                                                )}
                                            </div>

                                            {questionnaires.length > 0 ? (
                                                <div className="space-y-4">
                                                    {questionnaires.map((q) => (
                                                        <div
                                                            key={q.$id}
                                                            className={`border rounded-lg p-4 ${q.status === 'pending'
                                                                ? 'border-amber-200 bg-amber-50'
                                                                : q.status === 'submitted'
                                                                    ? 'border-blue-200 bg-blue-50'
                                                                    : 'border-neutral-200 bg-neutral-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <h4 className="font-medium text-neutral-900">
                                                                        {q.templateName}
                                                                    </h4>
                                                                    <p className="text-sm text-neutral-600 mt-1">
                                                                        Sent by {q.sentByName} on {formatDateTime(q.sentAt)}
                                                                    </p>
                                                                    {q.notes && (
                                                                        <p className="text-sm text-neutral-500 mt-2 italic">
                                                                            Note: {q.notes}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${q.status === 'pending'
                                                                    ? 'bg-amber-100 text-amber-700'
                                                                    : q.status === 'submitted'
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-neutral-100 text-neutral-600'
                                                                    }`}>
                                                                    {q.status}
                                                                </span>
                                                            </div>

                                                            {/* Show submitted responses by section */}
                                                            {q.status !== 'pending' && q.responseData && (
                                                                <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4">
                                                                    {q.template?.sections ? (
                                                                        // Section-wise display
                                                                        q.template.sections.map((section: any) => {
                                                                            const sectionFields = section.fields.filter((f: any) => q.responseData[f.id] !== undefined);
                                                                            if (sectionFields.length === 0) return null;
                                                                            return (
                                                                                <div key={section.id} className="bg-white rounded-lg border border-neutral-100 overflow-hidden">
                                                                                    <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-100">
                                                                                        <h5 className="text-sm font-medium text-neutral-700">
                                                                                            {section.title}
                                                                                        </h5>
                                                                                    </div>
                                                                                    <div className="p-3 grid grid-cols-2 gap-3">
                                                                                        {sectionFields.map((field: any) => (
                                                                                            <div key={field.id} className="text-sm">
                                                                                                <p className="text-xs text-neutral-500 mb-0.5">{field.label}</p>
                                                                                                <p className="font-medium text-neutral-900">
                                                                                                    {Array.isArray(q.responseData[field.id])
                                                                                                        ? q.responseData[field.id].join(', ')
                                                                                                        : q.responseData[field.id] || '-'}
                                                                                                </p>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        // Fallback: flat display if no template
                                                                        <div className="bg-white rounded-lg p-3">
                                                                            <h5 className="text-sm font-medium text-neutral-700 mb-2">Responses:</h5>
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                {Object.entries(q.responseData).map(([key, value]: [string, any]) => (
                                                                                    <div key={key}>
                                                                                        <p className="text-xs text-neutral-500">
                                                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                                                        </p>
                                                                                        <p className="text-sm font-medium text-neutral-900">
                                                                                            {Array.isArray(value) ? value.join(', ') : value || '-'}
                                                                                        </p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {q.status === 'pending' && q.submittedAt && (
                                                                <p className="text-sm text-green-600 mt-2">
                                                                    Submitted on {formatDateTime(q.submittedAt)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 text-neutral-500">
                                                    <FileQuestion className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                                                    <p>No questionnaires sent yet</p>
                                                    <p className="text-sm mt-1">
                                                        Click "Send Questionnaire" to request information from the client
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Update Status */}
                            <div className="bg-white rounded-xl border border-neutral-200 p-5">
                                <h3 className="font-semibold text-neutral-900 mb-4">Update Status</h3>
                                <div className="space-y-3">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                                    >
                                        <option value="new">New</option>
                                        <option value="pending_docs">Pending Documents</option>
                                        <option value="in_review">In Review</option>
                                        <option value="ready_for_filing">Ready for Filing</option>
                                        <option value="submitted">Submitted</option>
                                        <option value="pending_approval">Pending Approval</option>
                                        <option value="completed">Completed</option>
                                        <option value="on_hold">On Hold</option>
                                    </select>

                                    <textarea
                                        value={statusNote}
                                        onChange={(e) => setStatusNote(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                                        placeholder="Add internal note..."
                                    />

                                    <button
                                        onClick={handleStatusUpdate}
                                        disabled={saving || selectedStatus === order.status}
                                        className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                    >
                                        {saving ? 'Updating...' : 'Update Status'}
                                    </button>
                                </div>
                            </div>

                            {/* Certificates */}
                            <div className="bg-white rounded-xl border border-neutral-200 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-neutral-900">Certificates</h3>
                                    <button
                                        onClick={() => setShowCertificateUpload(!showCertificateUpload)}
                                        className="px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm"
                                    >
                                        {showCertificateUpload ? 'Cancel' : '+ Upload'}
                                    </button>
                                </div>

                                {showCertificateUpload ? (
                                    <CertificateUpload
                                        orderId={params.id}
                                        onUploadSuccess={handleCertificateUploadSuccess}
                                    />
                                ) : (
                                    <CertificateList
                                        orderId={params.id}
                                        certificates={certificates}
                                    />
                                )}
                            </div>

                            {/* Government Fees */}
                            <div className="bg-white rounded-xl border border-neutral-200 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-neutral-900">Government Fees</h3>
                                    <button
                                        onClick={() => setShowGovFeeModal(true)}
                                        className="px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm"
                                    >
                                        + Request Fee
                                    </button>
                                </div>

                                {govFeeRequests.length > 0 ? (
                                    <div className="space-y-3">
                                        {govFeeRequests.map((req) => (
                                            <div
                                                key={req.$id}
                                                className={`p-3 rounded-lg border ${req.status === 'pending'
                                                    ? 'bg-amber-50 border-amber-200'
                                                    : req.status === 'paid'
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-neutral-50 border-neutral-200'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${req.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : req.status === 'paid'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-neutral-100 text-neutral-700'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                    <span className="font-semibold text-neutral-900">
                                                        {formatCurrency(req.totalAmount)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-neutral-500">
                                                    Requested on {formatDate(req.$createdAt)}
                                                </p>
                                                {req.paidAt && (
                                                    <p className="text-xs text-green-600 mt-1">
                                                        Paid on {formatDate(req.paidAt)}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-neutral-500">
                                        <IndianRupee className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                                        <p className="text-sm">No fee requests yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white rounded-xl border border-neutral-200 p-5">
                                <h3 className="font-semibold text-neutral-900 mb-4">Payment Info</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-neutral-500">Status</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-neutral-500">Amount</span>
                                        <span className="font-semibold text-neutral-900">{formatCurrency(order.amount || 0)}</span>
                                    </div>
                                    {order.paymentId && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-neutral-500">Payment ID</span>
                                            <span className="text-xs font-mono text-neutral-600">{order.paymentId.substring(0, 16)}...</span>
                                        </div>
                                    )}
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

                    {/* Government Fee Request Modal */}
                    {order && service && (
                        <GovFeeRequestModal
                            isOpen={showGovFeeModal}
                            onClose={() => setShowGovFeeModal(false)}
                            orderId={order.$id}
                            customerId={order.customerId}
                            serviceId={order.serviceId}
                            serviceName={service?.name || 'Service'}
                            onSuccess={handleGovFeeRequestSuccess}
                        />
                    )}
                </div>
            
        </>
    );
}
