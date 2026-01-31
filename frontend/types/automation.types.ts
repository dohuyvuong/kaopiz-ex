/**
 * Automation types for frontend
 */

/**
 * Job types for automation
 */
export type JobType = 'auto-review-checklist' | 'auto-create-forms';

/**
 * Pending action status
 */
export type PendingActionStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';

/**
 * Notification channels
 */
export type NotificationChannel = 'telegram' | 'email';

/**
 * Payload for auto-review-checklist pending action
 */
export interface ChecklistReviewPayload {
  checklists: Array<{
    id: number;
    projectId: number;
    description: string;
    status: number;
  }>;
  maxReviews: number;
  projectName: string;
}

/**
 * Single form data in payload
 */
export interface FormPayloadItem {
  typeId: number;
  startDate: string;
  endDate: string;
  data: {
    reasonId: number;
    fromTime: string;
    toTime: string;
    note?: string;
  };
  applicationApprovals: Array<{
    userId: number;
    order: number;
  }>;
}

/**
 * Payload for auto-create-forms pending action
 */
export interface FormCreationPayload {
  forms: FormPayloadItem[];
  lookbackDays: number;
}

/**
 * Union type for all payload types
 */
export type PendingActionPayload = ChecklistReviewPayload | FormCreationPayload;
