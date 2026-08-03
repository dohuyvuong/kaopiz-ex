'use client';

/**
 * Trạng thái form tạo đơn.
 *
 * Khác bản cũ ở chỗ: KHÔNG chặn người dùng. Mọi ràng buộc đoán được đều hiển thị
 * dưới dạng cảnh báo (`warnings`), còn quyết định cuối thuộc về HRM — nếu HRM từ
 * chối thì ta hiện nguyên văn lý do. Bản cũ tự chặn theo suy đoán, mà suy đoán
 * lại lệch với chính phần auto-create của nó.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { applicationApi } from '@/lib/api/application';
import { extractErrorMessage } from '@/lib/api/error-message';
import {
  ApplicationFormReason,
  ApplicationFormType,
  ApprovalAssignment,
  CreateApplicationFormPayload,
} from '@/lib/types/application';
import {
  ApproverPreferences,
  ApproverPreferencesHelper,
} from '@/lib/types/approver-preferences';
import {
  CalendarDay,
  FormType,
  Reason,
  RuleWarning,
  TimesheetRules,
  checkDraftForm,
  suggestIntervalForDay,
  toMinutes,
} from '@kaopiz/timesheet';

interface UseCreateApplicationFormOptions {
  open: boolean;
  date: string;
  day: CalendarDay | null;
  rules: TimesheetRules | null;
  daysByDate: Map<string, CalendarDay>;
  userId?: number;
  today: string;
}

/** Lý do mặc định cho từng loại đơn, khớp thói quen dùng thực tế. */
const DEFAULT_REASON_BY_TYPE: Record<number, number> = {
  [FormType.LEAVE]: Reason.ANNUAL_LEAVE,
  [FormType.ABSENCE]: Reason.SHIFT_ADJUSTMENT,
};

export function useCreateApplicationForm({
  open,
  date,
  day,
  rules,
  daysByDate,
  userId,
  today,
}: UseCreateApplicationFormOptions) {
  const appToken = useAuthStore((state) => state.appToken);

  const [typeId, setTypeId] = useState<number>(FormType.ABSENCE);
  const [reasonId, setReasonId] = useState<number | null>(null);
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');

  const [types, setTypes] = useState<ApplicationFormType[]>([]);
  const [reasons, setReasons] = useState<ApplicationFormReason[]>([]);
  const [approvers, setApprovers] = useState<ApprovalAssignment[][]>([]);
  const [approverIds, setApproverIds] = useState<(number | null)[]>([]);
  const [, setPreferences] = useState<ApproverPreferences>([]);

  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isLoadingApprovers, setIsLoadingApprovers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedType = types.find((type) => type.id === typeId) ?? null;
  const approverCount = selectedType?.orderMax ?? 0;

  const minutes = useMemo(() => {
    const from = toMinutes(timeStart);
    const to = toMinutes(timeEnd);
    if (from == null || to == null || to <= from) return null;
    return to - from;
  }, [timeStart, timeEnd]);

  /* ------------------------------------------------------------ master data */

  useEffect(() => {
    if (!open || !appToken) return;
    setIsLoadingTypes(true);
    applicationApi
      .getFormTypes()
      .then((response) => setTypes(response.items ?? []))
      .catch(() => setTypes([]))
      .finally(() => setIsLoadingTypes(false));
  }, [open, appToken]);

  useEffect(() => {
    if (!open || !appToken || !typeId) return;
    applicationApi
      .getReasons(typeId)
      .then((response) => {
        const items = response.items ?? [];
        setReasons(items);
        const preferred = DEFAULT_REASON_BY_TYPE[typeId];
        const fallback = items[0]?.id ?? null;
        setReasonId(
          items.some((item) => item.id === preferred) ? preferred : fallback,
        );
      })
      .catch(() => setReasons([]));
  }, [open, appToken, typeId]);

  useEffect(() => {
    if (!open || !appToken || !userId || !selectedType) {
      setApprovers([]);
      setApproverIds([]);
      return;
    }

    setIsLoadingApprovers(true);
    Promise.all([
      applicationApi.getApproverPreferences(),
      ...Array.from({ length: selectedType.orderMax }, (_, index) =>
        applicationApi.getApprovalAssignments(typeId, index + 1, userId),
      ),
    ])
      .then(([preferencesResponse, ...assignmentResponses]) => {
        const saved = preferencesResponse.preferences ?? [];
        setPreferences(saved);

        const savedForType = ApproverPreferencesHelper.getByTypeId(
          saved,
          typeId,
        );
        const lists = assignmentResponses.map(
          (response) => response.items ?? [],
        );
        setApprovers(lists);
        setApproverIds(
          lists.map((list, index) => {
            const savedId = savedForType[index + 1] ?? null;
            return savedId && list.some((item) => item.userId === savedId)
              ? savedId
              : null;
          }),
        );
      })
      .catch(() => {
        setApprovers([]);
        setApproverIds([]);
      })
      .finally(() => setIsLoadingApprovers(false));
  }, [open, appToken, userId, selectedType, typeId]);

  /* ------------------------------------------------ giá trị mặc định khi mở */

  useEffect(() => {
    if (!open) return;
    setError(null);
    setTypeId(FormType.ABSENCE);
  }, [open, date]);

  // Gợi ý khoảng giờ dựa trên phần vi phạm chưa được đơn nào che.
  useEffect(() => {
    if (!open || !day || !rules) return;
    const limit =
      typeId === FormType.ABSENCE
        ? rules.reasonLimits.get(Reason.SHIFT_ADJUSTMENT)?.maxMinutesInDay
        : undefined;

    const suggestion = suggestIntervalForDay(day, rules, {
      maxMinutes: limit ?? undefined,
    });
    setTimeStart(suggestion?.timeStart ?? rules.workStart);
    setTimeEnd(suggestion?.timeEnd ?? rules.workEnd);
  }, [open, day, rules, typeId]);

  /* ----------------------------------------------------------- cảnh báo */

  const warnings = useMemo<RuleWarning[]>(() => {
    if (!open || !rules || !timeStart || !timeEnd) return [];
    return checkDraftForm(
      { date, typeId, reasonId, timeStart, timeEnd },
      { daysByDate, rules, today },
    );
  }, [open, rules, date, typeId, reasonId, timeStart, timeEnd, daysByDate, today]);

  const setApproverId = useCallback(
    (order: number, approverId: number | null) => {
      setApproverIds((prev) => {
        const next = [...prev];
        next[order] = approverId;
        return next;
      });
      setPreferences((prev) => {
        const next = ApproverPreferencesHelper.set(
          prev,
          typeId,
          order + 1,
          approverId,
        );
        void applicationApi.saveApproverPreferences(next).catch(() => {
          // Ghi nhớ người duyệt chỉ là tiện lợi, hỏng thì bỏ qua.
        });
        return next;
      });
    },
    [typeId],
  );

  const missingApproverOrder = approverIds
    .slice(0, approverCount)
    .findIndex((id) => !id);
  const canSubmit =
    !isSubmitting &&
    minutes != null &&
    reasonId != null &&
    (approverCount === 0 || missingApproverOrder === -1);

  const submit = useCallback(async (): Promise<boolean> => {
    if (!appToken) {
      setError('Chưa đăng nhập với HRM. Vui lòng đăng nhập.');
      return false;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Đơn xin nghỉ dùng dateStart/dateEnd, đơn vắng mặt dùng date — theo đúng
      // shape HRM chờ đợi cho từng loại.
      const tracking =
        typeId === FormType.LEAVE
          ? {
              dateStart: date,
              dateEnd: date,
              timeStart,
              timeEnd,
              reasonId: reasonId ?? undefined,
            }
          : {
              date,
              timeStart,
              timeEnd,
              reasonId: reasonId ?? undefined,
            };

      const payload: CreateApplicationFormPayload = {
        typeId,
        startDate: date,
        endDate: date,
        data: { reasonId: reasonId ?? undefined, trackingTimes: [tracking] },
        applicationApprovals: approverIds
          .slice(0, approverCount)
          .flatMap((id, index) =>
            id ? [{ userId: id, order: index + 1 }] : [],
          ),
        description: selectedType?.name ?? 'Đơn từ',
      };

      await applicationApi.createApplicationForm(payload);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, 'Không tạo được đơn từ'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    appToken,
    typeId,
    date,
    timeStart,
    timeEnd,
    reasonId,
    approverIds,
    approverCount,
    selectedType,
  ]);

  return {
    typeId,
    setTypeId,
    reasonId,
    setReasonId,
    timeStart,
    setTimeStart,
    timeEnd,
    setTimeEnd,
    minutes,

    types,
    reasons,
    selectedType,
    approvers,
    approverIds,
    setApproverId,
    approverCount,

    warnings,
    error,
    isLoadingTypes,
    isLoadingApprovers,
    isSubmitting,
    canSubmit,
    missingApproverOrder,
    submit,
  };
}
