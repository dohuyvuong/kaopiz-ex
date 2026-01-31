/**
 * Job types for background automation
 */
export enum JobType {
  AUTO_REVIEW_CHECKLIST = 'auto-review-checklist',
  AUTO_CREATE_FORMS = 'auto-create-forms',
}

/**
 * Pending action status
 */
export enum PendingActionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  AUTO_APPROVED = 'auto_approved',
}

/**
 * Notification channels
 */
export enum NotificationChannel {
  TELEGRAM = 'telegram',
  EMAIL = 'email',
}

/**
 * Checklist review status (Ksystem API)
 */
export enum ChecklistReviewStatus {
  PASSED = 1,
  FAILED = 2,
}

/**
 * Default values
 */
export const DEFAULT_AUTO_APPROVE_MINUTES = 30;
export const DEFAULT_MAX_REVIEWS = 10;
export const DEFAULT_LOOKBACK_DAYS = 7;

/**
 * Auto-approve comment
 */
export const AUTO_APPROVE_COMMENT = 'Auto-approved by system';
