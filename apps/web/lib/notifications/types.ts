export type NotificationType =
    | 'message'
    | 'status_change'
    | 'document_verified'
    | 'document_rejected'
    | 'certificate_uploaded'
    | 'payment_received'
    | 'case_assigned';

export interface NotificationItem {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    userId: string;
    orderId: string;
    type: NotificationType;
    message: string;
    title?: string;
    description?: string;
    actionUrl?: string;
    actionLabel?: string;
    read?: boolean;
    readAt?: string | null;
    sourceUserId?: string | null;
    metadata?: string | null;
}

export interface CreateNotificationData {
    userId: string;
    orderId: string;
    type: NotificationType;
    title: string;
    description: string;
    actionUrl: string;
    actionLabel: string;
    sourceUserId?: string;
    metadata?: Record<string, any>;
}
