/**
 * Params for auto-review-checklist job
 */
export interface ChecklistAutomationParams {
  maxReviews?: number;
  projectName?: string;
}

/**
 * Params for auto-create-forms job
 */
export interface FormAutomationParams {
  lookbackDays?: number;
}

/**
 * Union type for all automation params
 */
export type AutomationParams = ChecklistAutomationParams | FormAutomationParams;
