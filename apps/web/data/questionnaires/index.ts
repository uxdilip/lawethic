/**
 * QUESTIONNAIRES REGISTRY
 * =======================
 * Central registry of all questionnaire templates.
 * Add new questionnaires by importing and adding to QUESTIONNAIRES array.
 */

import { QuestionnaireTemplate } from './types';
import { trademarkQuestionnaire } from './trademark';

// Export all types
export * from './types';

// All available questionnaires
export const QUESTIONNAIRES: QuestionnaireTemplate[] = [
    trademarkQuestionnaire,
    // Add more questionnaires here as needed:
    // gstRegistrationQuestionnaire,
    // companyRegistrationQuestionnaire,
];

/**
 * Get questionnaire by ID
 */
export function getQuestionnaireById(id: string): QuestionnaireTemplate | undefined {
    return QUESTIONNAIRES.find(q => q.id === id);
}

/**
 * Get questionnaire by service slug
 */
export function getQuestionnaireByServiceSlug(slug: string): QuestionnaireTemplate | undefined {
    return QUESTIONNAIRES.find(q => q.serviceSlug === slug);
}

/**
 * Get all questionnaire summaries (for dropdown/selection)
 */
export function getQuestionnaireSummaries(): Array<{ id: string; name: string; serviceSlug: string }> {
    return QUESTIONNAIRES.map(q => ({
        id: q.id,
        name: q.name,
        serviceSlug: q.serviceSlug
    }));
}

/**
 * Check if a service has a questionnaire
 */
export function serviceHasQuestionnaire(serviceSlug: string): boolean {
    return QUESTIONNAIRES.some(q => q.serviceSlug === serviceSlug);
}
