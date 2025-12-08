import { CreateNotificationData } from './types';

export async function createNotification(data: CreateNotificationData): Promise<boolean> {
    try {
        const response = await fetch('/api/notifications/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Error creating notification:', error);
        return false;
    }
}

// Helper functions for common notification types

export async function notifyNewMessage(params: {
    recipientId: string;
    orderId: string;
    senderName: string;
    messagePreview: string;
    senderId: string;
}) {
    return createNotification({
        userId: params.recipientId,
        orderId: params.orderId,
        type: 'message',
        title: `New message from ${params.senderName}`,
        description: params.messagePreview,
        actionUrl: `/orders/${params.orderId}`,
        actionLabel: 'View Chat',
        sourceUserId: params.senderId,
        metadata: { messagePreview: params.messagePreview }
    });
}

export async function notifyStatusChange(params: {
    customerId: string;
    orderId: string;
    newStatus: string;
    orderNumber: string;
}) {
    return createNotification({
        userId: params.customerId,
        orderId: params.orderId,
        type: 'status_change',
        title: 'Order Status Updated',
        description: `Your order ${params.orderNumber} status changed to: ${params.newStatus}`,
        actionUrl: `/orders/${params.orderId}`,
        actionLabel: 'View Order',
        metadata: { status: params.newStatus }
    });
}

export async function notifyDocumentVerified(params: {
    customerId: string;
    orderId: string;
    documentType: string;
    orderNumber: string;
}) {
    return createNotification({
        userId: params.customerId,
        orderId: params.orderId,
        type: 'document_verified',
        title: `${params.documentType} Verified ✓`,
        description: `Your ${params.documentType} has been approved for order ${params.orderNumber}`,
        actionUrl: `/orders/${params.orderId}`,
        actionLabel: 'View Order'
    });
}

export async function notifyDocumentRejected(params: {
    customerId: string;
    orderId: string;
    documentType: string;
    reason: string;
    orderNumber: string;
}) {
    return createNotification({
        userId: params.customerId,
        orderId: params.orderId,
        type: 'document_rejected',
        title: `${params.documentType} Rejected ✗`,
        description: `Rejection reason: ${params.reason}`,
        actionUrl: `/orders/${params.orderId}`,
        actionLabel: 'View Details',
        metadata: { reason: params.reason }
    });
}

export async function notifyCertificateReady(params: {
    customerId: string;
    orderId: string;
    orderNumber: string;
    certificateType: string;
}) {
    return createNotification({
        userId: params.customerId,
        orderId: params.orderId,
        type: 'certificate_uploaded',
        title: '🎉 Your Certificates Are Ready!',
        description: `${params.certificateType} is now available for download`,
        actionUrl: `/orders/${params.orderId}`,
        actionLabel: 'Download Now',
        metadata: { certificateType: params.certificateType }
    });
}

export async function notifyPaymentReceived(params: {
    adminId: string;
    orderId: string;
    amount: number;
    customerName: string;
}) {
    return createNotification({
        userId: params.adminId,
        orderId: params.orderId,
        type: 'payment_received',
        title: 'Payment Received',
        description: `₹${params.amount.toLocaleString()} received from ${params.customerName}`,
        actionUrl: `/admin/cases/${params.orderId}`,
        actionLabel: 'View Case'
    });
}

export async function notifyCaseAssigned(params: {
    assigneeId: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
}) {
    return createNotification({
        userId: params.assigneeId,
        orderId: params.orderId,
        type: 'case_assigned',
        title: 'New Case Assigned',
        description: `Case ${params.orderNumber} from ${params.customerName} has been assigned to you`,
        actionUrl: `/admin/cases/${params.orderId}`,
        actionLabel: 'View Case'
    });
}
