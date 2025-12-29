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

// ============================================
// SERVICE CONTENT MANAGEMENT TYPES
// ============================================

export type ServiceContentStatus = 'draft' | 'published';

// Hero section content
export interface HeroContent {
    badge?: string;
    title: string;
    description: string;
    highlights: string[];
    formTitle?: string;
    formCta?: string;
    trustSignals?: {
        secure?: string;
        fast?: string;
        support?: string;
    };
    stats?: {
        count?: string;
        countLabel?: string;
        rating?: string;
        ratingLabel?: string;
        timeline?: string;
        timelineLabel?: string;
    };
}

// Pricing package
export interface PackageContent {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    timeline: string;
    featured: boolean;
    inclusions: string[];
    exclusions?: string[];
    emiAvailable?: boolean;
}

// Overview section
export interface OverviewContent {
    title: string;
    description: string; // Rich text HTML
    highlights?: string[];
}

// Eligibility entity
export interface EligibilityEntity {
    name: string;
    icon?: string; // Lucide icon name
}

// Eligibility section
export interface EligibilityContent {
    title: string;
    description?: string;
    entities: EligibilityEntity[];
}

// Type item (e.g., types of trademarks)
export interface TypeItemContent {
    name: string;
    description: string;
    icon?: string;
}

// Types section
export interface TypesContent {
    title: string;
    description?: string;
    items: TypeItemContent[];
}

// Fee row for fees table
export interface FeeRowContent {
    entityType: string;
    eFiling: string;
    physical?: string;
    notes?: string;
}

// Fees section
export interface FeesContent {
    title: string;
    description?: string;
    table: FeeRowContent[];
}

// Document group
export interface DocumentGroupContent {
    entityType: string;
    items: string[];
}

// Documents section
export interface DocumentsContent {
    title?: string;
    description?: string;
    groups: DocumentGroupContent[];
}

// Process step
export interface ProcessStepContent {
    step: number;
    title: string;
    description: string;
    duration: string;
    icon?: string;
}

// Benefit item
export interface BenefitItemContent {
    title: string;
    description: string;
    icon?: string;
}

// Benefits section
export interface BenefitsContent {
    title: string;
    description?: string;
    items: BenefitItemContent[];
}

// FAQ item
export interface FAQContent {
    question: string;
    answer: string; // Rich text HTML
}

// SEO/Meta content
export interface MetaContent {
    title: string;
    description: string;
    keywords: string[];
}

// Full service content structure
export interface ServiceContentData {
    // Basic info
    title: string;
    shortTitle?: string;
    category: string;
    categorySlug: string;
    basePrice: number;
    timeline: string;
    badge?: string;

    // Sections
    hero: HeroContent;
    packages: PackageContent[];
    overview?: OverviewContent;
    eligibility?: EligibilityContent;
    types?: TypesContent;
    fees?: FeesContent;
    documents?: DocumentsContent;
    process?: ProcessStepContent[];
    benefits?: BenefitsContent;
    faqs?: FAQContent[];
    meta: MetaContent;

    // Related services
    relatedServices?: string[];
}

// Database model for service content
export interface ServiceContent {
    $id: string;
    slug: string;
    version: number;
    status: ServiceContentStatus;
    content: string; // JSON stringified ServiceContentData
    editedBy: string;
    publishedAt?: string;
    changeNote?: string;
    $createdAt: string;
    $updatedAt: string;
}
