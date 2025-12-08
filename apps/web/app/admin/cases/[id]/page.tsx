'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { Query } from 'appwrite';
import AdminLayout from '@/components/AdminLayout';
import { StaffOnly } from '@/components/RoleGuard';
import Link from 'next/link';
import CertificateUpload, { CertificateList } from '@/components/admin/CertificateUpload';
import FloatingChatButton from '@/components/chat/FloatingChatButton';
import AssignmentDropdown from '@/components/admin/AssignmentDropdown';

interface CaseDetailProps {
    params: {
        id: string;
    };
}

export default function CaseDetailPage({ params }: CaseDetailProps) {
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [service, setService] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [showCertificateUpload, setShowCertificateUpload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusNote, setStatusNote] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        loadCaseDetails();
    }, [params.id]);

    const loadCaseDetails = async () => {
        try {
            setLoading(true);

            // Load order
            const orderDoc = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                params.id
            );

            // Parse formData if it's a string
            if (typeof orderDoc.formData === 'string') {
                orderDoc.formData = JSON.parse(orderDoc.formData);
            }

            setOrder(orderDoc);
            setSelectedStatus(orderDoc.status);

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

            // Load certificates
            await loadCertificates();

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

            if (!response.ok) {
                console.error('[Admin] Certificate API error:', response.status, data);
                return;
            }

            if (data.success) {
                setCertificates(data.certificates);
            }
        } catch (error) {
            console.error('[Admin] Failed to load certificates:', error);
        }
    };

    const handleCertificateUploadSuccess = () => {
        setShowCertificateUpload(false);
        loadCertificates();
    };

    const handleStatusUpdate = async () => {
        if (!order || selectedStatus === order.status) return;

        try {
            setSaving(true);

            // Update order status
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                params.id,
                {
                    status: selectedStatus,
                }
            );

            // Create timeline entry if note is provided
            if (statusNote.trim()) {
                await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.orderTimeline,
                    'unique()',
                    {
                        orderId: params.id,
                        action: 'status_change',
                        details: `Status changed to ${selectedStatus}. Note: ${statusNote}`,
                        performedBy: 'admin', // TODO: Get actual admin ID
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
            const result = storage.getFileView(
                appwriteConfig.buckets.customerDocuments,
                fileId
            );
            window.open(result.href, '_blank');
        } catch (error) {
            console.error('Failed to download document:', error);
            alert('Failed to download document');
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            new: 'bg-blue-100 text-blue-800',
            pending_docs: 'bg-yellow-100 text-yellow-800',
            in_review: 'bg-purple-100 text-purple-800',
            ready_for_filing: 'bg-indigo-100 text-indigo-800',
            submitted: 'bg-cyan-100 text-cyan-800',
            pending_approval: 'bg-orange-100 text-orange-800',
            completed: 'bg-green-100 text-green-800',
            on_hold: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getDocumentStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            verified: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <StaffOnly>
                <AdminLayout>
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </AdminLayout>
            </StaffOnly>
        );
    }

    if (!order) {
        return (
            <StaffOnly>
                <AdminLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
                            <Link href="/admin/cases" className="text-blue-600 hover:underline mt-4 inline-block">
                                ← Back to Cases
                            </Link>
                        </div>
                    </div>
                </AdminLayout>
            </StaffOnly>
        );
    }

    return (
        <StaffOnly>
            <AdminLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href="/admin/cases" className="text-blue-600 hover:underline text-sm">
                            ← Back to Cases
                        </Link>
                        <div className="mt-2 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Order #{order.orderNumber}
                                </h1>
                                <p className="mt-1 text-gray-600">
                                    Created on {new Date(order.$createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 items-end">
                                {/* Assignment Dropdown */}
                                <AssignmentDropdown
                                    orderId={order.$id}
                                    currentAssignment={order.assignedTo}
                                    onAssignmentChange={loadCaseDetails}
                                />

                                {/* Status Badges */}
                                <div className="flex gap-2">
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                        {order.status.replace(/_/g, ' ')}
                                    </span>
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${order.paymentStatus === 'paid'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        Payment: {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Information */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Business Name</p>
                                        <p className="font-medium">{order.formData?.businessName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Mobile</p>
                                        <p className="font-medium">{order.formData?.mobile || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">PAN Number</p>
                                        <p className="font-medium">{order.formData?.panNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Customer ID</p>
                                        <p className="font-medium text-sm">{order.customerId}</p>
                                    </div>
                                    {order.formData?.address && (
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-500">Address</p>
                                            <p className="font-medium">{order.formData.address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Service Details */}
                            {service && (
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Service Details</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Service</p>
                                            <p className="font-medium text-lg">{service.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Description</p>
                                            <p className="text-gray-700">{service.shortDescription}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Amount</p>
                                                <p className="font-bold text-lg text-blue-600">
                                                    {formatCurrency(order.amount || 0)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Estimated Days</p>
                                                <p className="font-medium">{service.estimatedDays}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Documents Section */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Documents ({documents.length})
                                </h2>
                                {documents.length === 0 ? (
                                    <p className="text-gray-500">No documents uploaded yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {documents.map((doc) => (
                                            <div key={doc.$id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium">{doc.fileName}</p>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDocumentStatusColor(doc.status)}`}>
                                                                {doc.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Uploaded: {new Date(doc.$createdAt).toLocaleString()}
                                                        </p>
                                                        {doc.rejectionReason && (
                                                            <p className="text-sm text-red-600 mt-2">
                                                                Rejection reason: {doc.rejectionReason}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => downloadDocument(doc.fileId, doc.fileName)}
                                                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                                        >
                                                            View
                                                        </button>
                                                        {doc.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleDocumentAction(doc.$id, 'verify')}
                                                                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                                >
                                                                    ✓ Verify
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const reason = prompt('Reason for rejection:');
                                                                        if (reason) {
                                                                            handleDocumentAction(doc.$id, 'reject', reason);
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                                >
                                                                    ✗ Reject
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Status Management */}
                        <div className="space-y-6">
                            {/* Certificates Section */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Certificates</h2>
                                    <button
                                        onClick={() => setShowCertificateUpload(!showCertificateUpload)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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

                            {/* Status Management */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Update Status</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Internal Note (Optional)
                                        </label>
                                        <textarea
                                            value={statusNote}
                                            onChange={(e) => setStatusNote(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Add a note about this status change..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleStatusUpdate}
                                        disabled={saving || selectedStatus === order.status}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {saving ? 'Updating...' : 'Update Status'}
                                    </button>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Info</h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <p className="font-medium capitalize">{order.paymentStatus}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Amount</p>
                                        <p className="font-bold text-lg">{formatCurrency(order.amount || 0)}</p>
                                    </div>
                                    {order.paymentId && (
                                        <div>
                                            <p className="text-sm text-gray-500">Payment ID</p>
                                            <p className="font-mono text-sm">{order.paymentId}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                                <div className="space-y-2">
                                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left">
                                        📧 Send Email to Customer
                                    </button>
                                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left">
                                        📄 Upload Certificate
                                    </button>
                                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left">
                                        📋 View Timeline
                                    </button>
                                </div>
                            </div>

                            {/* Chat Section - Floating Button */}
                            {order && (
                                <FloatingChatButton
                                    orderId={order.$id}
                                    orderNumber={order.orderNumber || order.$id}
                                />
                            )}
                        </div>
                    </div>
                </div >
            </AdminLayout >
        </StaffOnly >
    );
}
