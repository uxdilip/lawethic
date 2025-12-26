/**
 * QUESTIONNAIRE SYSTEM TYPES
 * ==========================
 * Types for in-app questionnaire forms sent to clients
 */

export type QuestionFieldType =
    | 'text'
    | 'textarea'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'date'
    | 'email'
    | 'phone'
    | 'file';

export interface QuestionOption {
    value: string;
    label: string;
}

export interface QuestionField {
    id: string;
    label: string;
    type: QuestionFieldType;
    required: boolean;
    placeholder?: string;
    helpText?: string;
    options?: QuestionOption[];
    validation?: {
        pattern?: string;
        minLength?: number;
        maxLength?: number;
    };
}

export interface QuestionSection {
    id: string;
    title: string;
    description?: string;
    fields: QuestionField[];
}

export interface QuestionnaireTemplate {
    id: string;
    name: string;
    description: string;
    serviceSlug: string; // Links to specific service
    sections: QuestionSection[];
    createdAt: string;
    version: number;
}

// Database model for questionnaire requests
export interface QuestionnaireRequest {
    $id: string;
    orderId: string;
    templateId: string;
    templateVersion: number;
    status: 'pending' | 'submitted' | 'reviewed';
    sentBy: string;
    sentByName: string;
    sentAt: string;
    submittedAt?: string;
    responseData?: Record<string, any>;
    notes?: string;
    $createdAt: string;
    $updatedAt: string;
}
