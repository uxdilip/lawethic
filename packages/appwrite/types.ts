// User roles
export type UserRole = 'customer' | 'operations' | 'admin';

// Order status
export type OrderStatus =
    | 'new'
    | 'pending_docs'
    | 'in_review'
    | 'ready_for_filing'
    | 'submitted'
    | 'pending_approval'
    | 'completed'
    | 'on_hold';

// Payment status
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Document status
export type DocumentStatus = 'pending' | 'verified' | 'rejected';

// Notification types
export type NotificationType =
    | 'order_placed'
    | 'docs_requested'
    | 'status_update'
    | 'certificate_ready'
    | 'payment_success'
    | 'message_received';

// Question field for service-specific forms
export interface QuestionField {
    id: string;
    label: string;
    type: 'text' | 'select' | 'radio' | 'textarea' | 'checkbox';
    options?: string[];
    required: boolean;
    placeholder?: string;
    helpText?: string;
}

// Database Models
export interface User {
    $id: string;
    email: string;
    name: string;
    phone?: string;
    emailVerification: boolean;
    phoneVerification: boolean;
    prefs: {
        role?: UserRole;
        fullName?: string;
        mobile?: string;
        panNumber?: string;
    };
    $createdAt: string;
    $updatedAt: string;
}

export interface Service {
    $id: string;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    price: number;
    documentRequired: string[];
    estimatedDays: string;
    isActive: boolean;
    category: string;
    features: string[];
    questionForm?: QuestionField[]; // Service-specific questions
    $createdAt: string;
    $updatedAt: string;
}

export interface Order {
    $id: string;
    orderNumber: string;
    customerId: string;
    serviceId: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentId?: string;
    amount: number;
    formData: Record<string, any>;
    assignedTo?: string;
    $createdAt: string;
    $updatedAt: string;
    completedAt?: string;
}

export interface Document {
    $id: string;
    orderId: string;
    fileId: string;
    fileName: string;
    fileType: string;
    uploadedBy: string;
    status: DocumentStatus;
    rejectionReason?: string;
    version?: number;
    previousVersionId?: string;
    reuploadedAt?: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface Message {
    $id: string;
    orderId: string;
    senderId: string;
    message: string;
    attachments: string[];
    isRead: boolean;
    $createdAt: string;
}

export interface Notification {
    $id: string;
    userId: string;
    orderId?: string;
    type: NotificationType;
    message: string;
    isRead: boolean;
    $createdAt: string;
}

export interface Payment {
    $id: string;
    orderId: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amount: number;
    status: PaymentStatus;
    method?: string;
    $createdAt: string;
}

export interface OrderTimeline {
    $id: string;
    orderId: string;
    status: OrderStatus;
    note: string;
    updatedBy: string;
    $createdAt: string;
}
