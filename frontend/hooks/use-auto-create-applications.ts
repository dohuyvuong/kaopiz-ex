'use client';

/**
 * Tạo hàng loạt các đơn do `suggestForms` đề xuất.
 *
 * Hook này chỉ lo phần I/O: lấy người duyệt, gửi từng đơn, theo dõi tiến độ.
 * Toàn bộ phần "nên tạo đơn nào" nằm ở `lib/timesheet/suggest.ts` và được test
 * riêng — bản cũ trộn hai việc này vào nhau nên không test được phần nào cả.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { applicationApi } from '@/lib/api/application';
import { extractErrorMessage } from '@/lib/api/error-message';
import {
  ApplicationFormType,
  CreateApplicationFormPayload,
} from '@/lib/types/application';
import {
  ApproverPreferences,
  ApproverPreferencesHelper,
} from '@/lib/types/approver-preferences';
import {
  CalendarDay,
  FormType,
  LateEarly,
  SuggestedForm,
  TimesheetRules,
  suggestForms,
  toMinutes,
} from '@kaopiz/timesheet';

interface UseAutoCreateOptions {
  open: boolean;
  days: CalendarDay[];
  rules: TimesheetRules | null;
  actualTotal: LateEarly | null;
  userId?: number;
  today: string;
  /** Số ngày phép năm còn lại — có thể ÂM nếu đã ứng trước. */
  annualLeaveAvailable: number;
}

export interface CreateFailure {
  form: SuggestedForm;
  reason: string;
}

/**
 * Khoá ổn định của một đơn đề xuất.
 *
 * KHÔNG gồm giờ: người dùng sửa được giờ, mà khoá đổi theo thì phần đã sửa và
 * phần đã bỏ sẽ mất dấu sau mỗi lần tính lại. Mỗi (ngày, loại đơn, chiều che)
 * chỉ sinh tối đa một đề xuất nên bấy nhiêu là đủ phân biệt.
 */
function formKey(form: SuggestedForm): string {
  return `${form.date}|${form.typeId}|${form.covers}`;
}

/** Giờ do người dùng chỉnh tay, đè lên giờ máy đề xuất. */
interface TimeOverride {
  timeStart: string;
  timeEnd: string;
}

export function useAutoCreateApplications({
  open,
  days,
  rules,
  actualTotal,
  userId,
  today,
  annualLeaveAvailable,
}: UseAutoCreateOptions) {
  const appToken = useAuthStore((state) => state.appToken);

  const [types, setTypes] = useState<ApplicationFormType[]>([]);
  const [preferences, setPreferences] = useState<ApproverPreferences>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [failures, setFailures] = useState<CreateFailure[]>([]);
  /** Các đơn người dùng đã bỏ khỏi danh sách, theo khoá ổn định. */
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  /** Giờ người dùng tự sửa, theo khoá ổn định. */
  const [overrides, setOverrides] = useState<Map<string, TimeOverride>>(
    new Map(),
  );

  const suggestion = useMemo(() => {
    if (!rules || !actualTotal) return null;
    return suggestForms({ days, rules, actualTotal, today });
  }, [days, rules, actualTotal, today]);

  /**
   * Danh sách hiển thị là dữ liệu DẪN XUẤT từ đề xuất, không phải bản sao trong
   * state. Nhờ vậy khi dữ liệu nền được tải xong và đề xuất tính lại, danh sách
   * tự cập nhật mà vẫn giữ nguyên những dòng người dùng đã bỏ.
   */
  const forms = useMemo(
    () =>
      (suggestion?.forms ?? [])
        .filter((form) => !dismissed.has(formKey(form)))
        .map((form) => {
          const override = overrides.get(formKey(form));
          if (!override) return form;
          const minutes = durationMinutes(
            override.timeStart,
            override.timeEnd,
          );
          return {
            ...form,
            timeStart: override.timeStart,
            timeEnd: override.timeEnd,
            // Giờ đổi thì số phút che được cũng đổi theo.
            minutes: minutes ?? 0,
          };
        }),
    [suggestion, dismissed, overrides],
  );

  useEffect(() => {
    if (!open) return;
    setDismissed(new Set());
    setOverrides(new Map());
    setFailures([]);
    setProgress({ current: 0, total: 0 });
  }, [open]);

  useEffect(() => {
    if (!open || !appToken) return;
    Promise.all([
      applicationApi.getFormTypes(),
      applicationApi.getApproverPreferences(),
    ])
      .then(([typesResponse, preferencesResponse]) => {
        setTypes(typesResponse.items ?? []);
        setPreferences(preferencesResponse.preferences ?? []);
      })
      .catch(() => {
        setTypes([]);
        setPreferences([]);
      });
  }, [open, appToken]);

  /** Loại đơn nào còn thiếu người duyệt đã lưu — chặn trước khi gửi cho đỡ phí. */
  const missingApprovers = useMemo(() => {
    const missing: Array<{ typeName: string; orders: number[] }> = [];
    const usedTypeIds = [...new Set(forms.map((form) => form.typeId))];

    for (const typeId of usedTypeIds) {
      const type = types.find((item) => item.id === typeId);
      if (!type) continue;
      const saved = ApproverPreferencesHelper.getByTypeId(preferences, typeId);
      const orders = Array.from(
        { length: type.orderMax },
        (_, index) => index + 1,
      ).filter((order) => !saved[order]);
      if (orders.length > 0) missing.push({ typeName: type.name, orders });
    }

    return missing;
  }, [forms, types, preferences]);

  const totalMinutes = forms.reduce((sum, form) => sum + form.minutes, 0);
  const annualLeaveMinutes = forms
    .filter((form) => form.usesAnnualLeave)
    .reduce((sum, form) => sum + form.minutes, 0);

  /**
   * Phép năm quy ra NGÀY để so với số dư HRM trả về.
   *
   * `availableThisYear` có thể âm — HRM cho ứng trước phép. Ta không chặn (giữ
   * đúng nguyên tắc "cảnh báo, không chặn"), nhưng phải nói rõ để người dùng
   * biết mình đang tiêu vào phần ứng trước.
   */
  const annualLeaveDays =
    rules && rules.workingHoursPerDay > 0
      ? annualLeaveMinutes / (rules.workingHoursPerDay * 60)
      : 0;
  const annualLeaveAfter = annualLeaveAvailable - annualLeaveDays;
  const exceedsAnnualLeave = annualLeaveDays > 0 && annualLeaveAfter < 0;

  const removeForm = useCallback((form: SuggestedForm) => {
    setDismissed((prev) => new Set(prev).add(formKey(form)));
  }, []);

  const setFormTime = useCallback(
    (form: SuggestedForm, patch: Partial<TimeOverride>) => {
      setOverrides((prev) => {
        const key = formKey(form);
        const current = prev.get(key) ?? {
          timeStart: form.timeStart,
          timeEnd: form.timeEnd,
        };
        return new Map(prev).set(key, { ...current, ...patch });
      });
    },
    [],
  );

  /** Đơn có giờ không hợp lệ thì chặn gửi — cái này là lỗi kỹ thuật, không phải rule HRM. */
  const hasInvalidTime = forms.some((form) => form.minutes <= 0);

  const createAll = useCallback(async (): Promise<boolean> => {
    if (!appToken || !userId || forms.length === 0) return false;

    setIsCreating(true);
    setFailures([]);
    setProgress({ current: 0, total: forms.length });

    // Người duyệt đã lưu có thể đã nghỉ việc hoặc đổi phòng ban. Đối chiếu với
    // danh sách hiện hành để báo lỗi rõ ràng tại chỗ, thay vì để HRM từ chối
    // giữa chừng khi đã tạo được một nửa số đơn.
    const assignments = new Map<string, number[]>();
    try {
      const usedTypeIds = [...new Set(forms.map((form) => form.typeId))];
      for (const typeId of usedTypeIds) {
        const type = types.find((item) => item.id === typeId);
        for (let order = 1; order <= (type?.orderMax ?? 0); order += 1) {
          const response = await applicationApi.getApprovalAssignments(
            typeId,
            order,
            userId,
          );
          assignments.set(
            `${typeId}|${order}`,
            (response.items ?? []).map((item) => item.userId),
          );
        }
      }
    } catch {
      // Không lấy được danh sách thì bỏ qua bước đối chiếu — thà gửi đi và để
      // HRM phán, còn hơn chặn người dùng vì một API phụ lỗi.
      assignments.clear();
    }

    const failed: CreateFailure[] = [];

    for (const [index, form] of forms.entries()) {
      setProgress({ current: index + 1, total: forms.length });
      try {
        const type = types.find((item) => item.id === form.typeId);
        const saved = ApproverPreferencesHelper.getByTypeId(
          preferences,
          form.typeId,
        );
        const approvals = Array.from(
          { length: type?.orderMax ?? 0 },
          (_, position) => position + 1,
        ).flatMap((order) => {
          const approverId = saved[order];
          if (!approverId) return [];

          const valid = assignments.get(`${form.typeId}|${order}`);
          if (valid && !valid.includes(approverId)) {
            throw new Error(
              `Người duyệt ${order} đã lưu không còn trong danh sách được duyệt ` +
                `"${type?.name ?? form.typeId}". Chọn lại người duyệt.`,
            );
          }
          return [{ userId: approverId, order }];
        });

        if (type && approvals.length < type.orderMax) {
          throw new Error(
            `Chưa chọn đủ người duyệt cho "${type.name}". Vào phần cài đặt người duyệt trước.`,
          );
        }

        const tracking =
          form.typeId === FormType.LEAVE
            ? {
                dateStart: form.date,
                dateEnd: form.date,
                timeStart: form.timeStart,
                timeEnd: form.timeEnd,
                reasonId: form.reasonId,
              }
            : {
                date: form.date,
                timeStart: form.timeStart,
                timeEnd: form.timeEnd,
                reasonId: form.reasonId,
              };

        const payload: CreateApplicationFormPayload = {
          typeId: form.typeId,
          startDate: form.date,
          endDate: form.date,
          data: { reasonId: form.reasonId, trackingTimes: [tracking] },
          applicationApprovals: approvals,
          description: form.description,
        };

        await applicationApi.createApplicationForm(payload);
      } catch (err) {
        // Một đơn hỏng không nên chặn các đơn còn lại.
        failed.push({
          form,
          reason: extractErrorMessage(err, 'Không tạo được đơn'),
        });
      }
    }

    setProgress({ current: 0, total: 0 });
    setIsCreating(false);
    setFailures(failed);

    // Đơn tạo thành công sẽ biến mất khỏi đề xuất sau khi dữ liệu tải lại (vì
    // phần vi phạm đã được che). Chỉ cần bỏ đi những đơn đã gửi được, phần thất
    // bại giữ nguyên để thử lại.
    const failedKeys = new Set(failed.map((failure) => formKey(failure.form)));
    setDismissed((prev) => {
      const next = new Set(prev);
      for (const form of forms) {
        if (!failedKeys.has(formKey(form))) next.add(formKey(form));
      }
      return next;
    });

    return failed.length === 0;
  }, [appToken, userId, forms, types, preferences]);

  return {
    suggestion,
    forms,
    formKey,
    removeForm,
    setFormTime,
    hasInvalidTime,
    totalMinutes,
    annualLeaveMinutes,
    annualLeaveDays,
    annualLeaveAvailable,
    annualLeaveAfter,
    exceedsAnnualLeave,
    missingApprovers,
    isCreating,
    progress,
    failures,
    createAll,
  };
}

/** Số phút giữa hai mốc "HH:mm"; `null` nếu không hợp lệ. */
function durationMinutes(start: string, end: string): number | null {
  const from = toMinutes(start);
  const to = toMinutes(end);
  if (from == null || to == null || to <= from) return null;
  return to - from;
}
