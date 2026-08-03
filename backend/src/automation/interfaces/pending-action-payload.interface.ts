import type { SuggestedForm } from '@kaopiz/timesheet';

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
 * Payload for auto-create-forms pending action.
 *
 * Chứa thẳng các đơn do `suggestForms` (package `@kaopiz/timesheet`) đề xuất —
 * cùng một hàm mà nút "Tự động tạo đơn" trên giao diện dùng, nên cron và UI
 * không thể ra hai kết quả khác nhau.
 *
 * Cố ý KHÔNG lưu sẵn người duyệt: từ lúc gửi thông báo tới lúc người dùng bấm
 * duyệt có thể cách nhau hàng giờ, nên người duyệt được tra lại tại thời điểm
 * thực thi.
 */
export interface FormCreationPayload {
  forms: SuggestedForm[];
  /** Tháng đã quét, dạng "MM-YYYY" — để hiển thị lại trong thông báo. */
  monthYear: string;
  /** Tổng số phút các đơn này che được. */
  coveredMinutes: number;
}

/**
 * Union type for all payload types
 */
export type PendingActionPayload = ChecklistReviewPayload | FormCreationPayload;
