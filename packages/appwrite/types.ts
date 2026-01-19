// User roles
export type UserRole = 'customer' | 'operations' | 'admin' | 'expert';

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
    | 'message_received'
    | 'consultation_submitted'
    | 'consultation_scheduled'
    | 'consultation_reminder'
    | 'consultation_completed';

// Consultation case status
export type ConsultationStatus =
    | 'submitted'
    | 'under_review'
    | 'pending_assignment'
    | 'meeting_scheduled'
    | 'meeting_completed'
    | 'recommendations_sent'
    | 'converted'
    | 'cancelled'
    | 'closed';

// Consultation booking status
export type BookingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

// Business type for consultations
export type BusinessType = 'startup' | 'existing_business' | 'legal';

// Case types for consultations
export type CaseType =
    | 'start-pvt-ltd'
    | 'start-llp'
    | 'start-opc'
    | 'start-partnership'
    | 'start-proprietorship'
    | 'convert-to-pvt'
    | 'annual-compliance'
    | 'gst-matters'
    | 'trademark-ip'
    | 'hiring-hr'
    | 'import-export'
    | 'food-business'
    | 'ngo-trust'
    | 'legal-docs'
    | 'tax-matters'
    | 'funding-investment'
    | 'general-query';

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
    senderName?: string;
    senderRole?: string;
    message: string;
    messageType?: 'text' | 'file' | 'system';
    attachments?: string[];
    metadata?: string | null;
    read?: boolean;
    readAt?: string | null;
    isRead?: boolean;
    isConsultation?: boolean;
    $createdAt: string;
    $updatedAt?: string;
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
// CONSULTATION TYPES
// ============================================

export interface ConsultationCase {
    $id: string;
    caseNumber: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    businessType: BusinessType;
    caseType: CaseType;
    title: string;
    description: string;
    attachments: string[];
    status: ConsultationStatus;
    scheduledAt?: string;
    meetingLink?: string;
    assignedExpertId?: string;
    expertNotes?: string;
    recommendations?: string;
    recommendationsSentAt?: string;
    suggestedServiceSlugs: string[];
    convertedOrderIds: string[];
    amount: number;
    paymentStatus: PaymentStatus | 'free';
    paymentId?: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface ExpertAvailability {
    $id: string;
    expertId: string;
    dayOfWeek: number; // 0 (Sun) - 6 (Sat)
    startTime: string; // "10:00"
    endTime: string; // "18:00"
    slotDuration: number; // minutes
    bufferTime: number; // minutes
    isActive: boolean;
    $createdAt: string;
    $updatedAt: string;
}

export interface ExpertBlockedDate {
    $id: string;
    expertId: string;
    date: string; // "2026-01-20"
    reason?: string;
    $createdAt: string;
}

export interface ConsultationBooking {
    $id: string;
    caseId: string;
    customerId: string;
    expertId: string;
    date: string; // "2026-01-17"
    startTime: string; // "14:00"
    endTime: string; // "14:30"
    meetingLink: string;
    status: BookingStatus;
    notes?: string;
    $createdAt: string;
    $updatedAt: string;
}

// Case type to service suggestions mapping
export const CASE_TYPE_SUGGESTIONS: Record<CaseType, string[]> = {
    'start-pvt-ltd': ['private-limited-company-registration', 'gst-registration', 'trademark-registration'],
    'start-llp': ['llp-registration', 'gst-registration', 'llp-agreement'],
    'start-opc': ['one-person-company-registration', 'gst-registration'],
    'start-partnership': ['partnership-firm-registration', 'partnership-deed', 'gst-registration'],
    'start-proprietorship': ['gst-registration', 'msme-registration', 'shop-establishment'],
    'convert-to-pvt': ['proprietorship-to-pvt-ltd', 'llp-to-pvt-ltd'],
    'annual-compliance': ['annual-compliance-private-limited', 'roc-filing', 'annual-return-filing'],
    'gst-matters': ['gst-registration', 'gst-return-filing', 'gst-cancellation'],
    'trademark-ip': ['trademark-registration', 'trademark-objection', 'trademark-renewal'],
    'hiring-hr': ['pf-registration', 'esi-registration', 'professional-tax'],
    'import-export': ['iec-registration', 'gst-registration'],
    'food-business': ['fssai-registration', 'fssai-license', 'gst-registration'],
    'ngo-trust': ['ngo-registration', 'section-8-company', 'trust-registration'],
    'legal-docs': ['legal-drafting', 'mou-agreement', 'nda-agreement'],
    'tax-matters': ['income-tax-filing', 'tax-planning', 'tax-notice-response'],
    'funding-investment': ['startup-india-registration', 'pitch-deck-review', 'term-sheet-review'],
    'general-query': [],
};

// Case type display names
export const CASE_TYPE_LABELS: Record<CaseType, string> = {
    'start-pvt-ltd': 'Starting a Private Limited Company',
    'start-llp': 'Starting an LLP',
    'start-opc': 'Starting One Person Company',
    'start-partnership': 'Starting a Partnership',
    'start-proprietorship': 'Starting Sole Proprietorship',
    'convert-to-pvt': 'Convert to Private Limited',
    'annual-compliance': 'Annual Compliance & Filings',
    'gst-matters': 'GST Registration & Returns',
    'trademark-ip': 'Trademark & Intellectual Property',
    'hiring-hr': 'Hiring & HR Compliance',
    'import-export': 'Import/Export Business',
    'food-business': 'Food & Restaurant Business',
    'ngo-trust': 'NGO / Trust / Society',
    'legal-docs': 'Legal Documentation',
    'tax-matters': 'Income Tax & Tax Planning',
    'funding-investment': 'Funding & Investment',
    'general-query': 'General Legal Query',
};

// Business type display names
export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
    'startup': 'Starting a New Business',
    'existing_business': 'I Have an Existing Business',
    'legal': 'Legal Matter',
};

// Consultation status display names
export const CASE_STATUS_LABELS: Record<ConsultationStatus, string> = {
    'submitted': 'Submitted',
    'under_review': 'Under Review',
    'pending_assignment': 'Pending Assignment',
    'meeting_scheduled': 'Meeting Scheduled',
    'meeting_completed': 'Meeting Completed',
    'recommendations_sent': 'Recommendations Sent',
    'converted': 'Converted to Order',
    'cancelled': 'Cancelled',
    'closed': 'Closed',
};

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
