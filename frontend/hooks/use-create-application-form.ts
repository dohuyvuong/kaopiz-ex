import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { applicationApi } from '@/lib/api/application';
import {
  CreateApplicationFormPayload,
  ApplicationFormType,
  ApplicationFormReason,
  ApprovalAssignment,
} from '@/lib/types/application';
import {
  ApproverPreferences,
  ApproverPreferencesHelper,
} from '@/lib/types/approver-preferences';
import { TimesheetDay } from '@/lib/types/timesheet';
import { DayDetailApplicationForm } from '@/lib/types/timesheet-day-detail';
import dayjs from 'dayjs';
import {
  checkOverlappingForms,
  checkAbsenceFormInWeek,
  getMissingTimeRanges,
  calculateMinutes,
} from '@/lib/utils/application-form';

interface UseCreateApplicationFormProps {
  open: boolean;
  date: string;
  calendarDay?: TimesheetDay | null;
  workingTime?: { workStart: string; workEnd: string } | null;
  calendarDays?: Array<{ date: Date; timesheet: TimesheetDay | null }>;
  mergedDays?: Map<string, TimesheetDay & { hasPendingForms?: boolean }>;
  dayDetail?: { applicationForms?: DayDetailApplicationForm[] } | null;
  userId?: number; // User ID từ calendar response
}

interface UseCreateApplicationFormReturn {
  // Form state
  typeId: number;
  setTypeId: (typeId: number) => void;
  reasonId: number | null;
  setReasonId: (reasonId: number | null) => void;
  approverIds: (number | null)[];
  setApproverId: (order: number, approverId: number | null) => void;
  timeStart: string;
  setTimeStart: (timeStart: string) => void;
  timeEnd: string;
  setTimeEnd: (timeEnd: string) => void;

  // Data
  types: ApplicationFormType[];
  reasons: ApplicationFormReason[];
  selectedType: ApplicationFormType | null;
  availableReasons: ApplicationFormReason[];
  selectedReason: ApplicationFormReason | null;
  selectedReasonDisplayName: string | null;
  approvers: ApprovalAssignment[][]; // Array of arrays, index = order (0-based)
  loadingApprovers: boolean;

  // UI state
  loading: boolean;
  loadingTypes: boolean;
  error: string | null;
  validationError: string | null;
  warningMessage: string | null;

  // Computed values
  minutes: number | null;

  // Actions
  handleSubmit: () => Promise<boolean>;
  validate: () => boolean;
}


export function useCreateApplicationForm({
  open,
  date,
  calendarDay,
  workingTime,
  calendarDays,
  mergedDays,
  dayDetail,
  userId,
}: UseCreateApplicationFormProps): UseCreateApplicationFormReturn {
  const appToken = useAuthStore((state) => state.appToken);
  const [, setPreferences] = useState<ApproverPreferences>([]);

  const [typeId, setTypeId] = useState<number>(2);
  const [reasonId, setReasonId] = useState<number | null>(null);
  const [approverIds, setApproverIds] = useState<(number | null)[]>([]);
  const prevTypeIdRef = useRef<number | null>(null);
  const [timeStart, setTimeStart] = useState<string>('');
  const [timeEnd, setTimeEnd] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [types, setTypes] = useState<ApplicationFormType[]>([]);
  const [reasons, setReasons] = useState<ApplicationFormReason[]>([]);
  const [approvers, setApprovers] = useState<ApprovalAssignment[][]>([]);

  // Tính số phút
  const minutes = calculateMinutes(timeStart, timeEnd);

  // Selected type và available reasons
  const selectedType = types.find((t) => t.id === typeId) || null;
  // Reasons đã được filter theo typeId từ API, nên dùng trực tiếp
  const availableReasons = reasons;

  // Selected reason với text rút gọn
  const selectedReason = availableReasons.find((r) => r.id === reasonId) || null;
  const selectedReasonDisplayName = selectedReason
    ? selectedReason.name.length > 50
      ? `${selectedReason.name.substring(0, 50)}...`
      : selectedReason.name
    : null;

  // Fetch types khi mở dialog
  useEffect(() => {
    if (open && appToken) {
      const fetchTypes = async () => {
        setLoadingTypes(true);
        try {
          // Fetch types
          const typesResponse = await applicationApi.getFormTypes();
          setTypes(typesResponse.items || []);
        } catch (err) {
          console.error('Failed to fetch form types:', err);
          // Fallback to hardcoded types nếu API fail
          setTypes([
            { id: 1, name: 'Đơn xin nghỉ', orderMax: 2 },
            { id: 2, name: 'Đơn vắng mặt', orderMax: 1 },
          ]);
        } finally {
          setLoadingTypes(false);
        }
      };

      fetchTypes();
    }
  }, [open, appToken]);

  // Fetch reasons khi typeId thay đổi
  useEffect(() => {
    if (open && appToken && typeId) {
      const fetchReasons = async () => {
        try {
          const reasonsResponse = await applicationApi.getReasons(
            typeId,
          );
          setReasons(reasonsResponse.items || []);

          // Tự động chọn reasonId dựa trên typeId và calendarDay
          if (typeId === 1) {
            // Đơn xin nghỉ: tự động chọn "Nghỉ phép năm" (reasonId = 4)
            const annualLeaveReason = reasonsResponse.items?.find(
              (r) => r.id === 4,
            );
            if (annualLeaveReason) {
              setReasonId(4);
            } else if (reasonsResponse.items && reasonsResponse.items.length > 0) {
              setReasonId(reasonsResponse.items[0].id);
            }
          } else if (typeId === 2) {
            // Đơn vắng mặt: nếu có dữ liệu chấm công thì chọn "Thay đổi thời gian làm việc" (reasonId = 21)
            if (calendarDay && (calendarDay.timeIn || calendarDay.timeOut)) {
              const changeWorkTimeReason = reasonsResponse.items?.find(
                (r) => r.id === 21,
              );
              if (changeWorkTimeReason) {
                setReasonId(21);
              } else if (reasonsResponse.items && reasonsResponse.items.length > 0) {
                setReasonId(reasonsResponse.items[0].id);
              }
            } else if (reasonsResponse.items && reasonsResponse.items.length > 0) {
              setReasonId(reasonsResponse.items[0].id);
            }
          }
        } catch (err) {
          console.error('Failed to fetch reasons:', err);
          setReasons([]);
        }
      };

      fetchReasons();
    }
  }, [typeId, open, appToken, calendarDay]);

  // Số lượng người duyệt cho từng loại đơn (orderMax = số lượng người duyệt)
  const getApproverCount = useCallback((type: ApplicationFormType | null): number => {
    if (!type) return 0;
    // orderMax là số lượng người duyệt (1-based), nhưng chúng ta dùng 0-based index
    return type.orderMax;
  }, []);

  // Fetch approver preferences + người duyệt khi mở form / typeId thay đổi
  useEffect(() => {
    if (!open || !appToken || !typeId || !selectedType || !userId) {
      setApprovers([]);
      setApproverIds([]);
      return;
    }

    const fetchAll = async () => {
      setLoadingApprovers(true);
      try {
        const [prefsRes, ...approverResponses] = await Promise.all([
          applicationApi.getApproverPreferences(),
          ...Array.from({ length: getApproverCount(selectedType) }, (_, order) =>
            applicationApi.getApprovalAssignments(
              typeId,
              order + 1,
              userId,
            ),
          ),
        ]);

        const prefs = prefsRes.preferences ?? [];
        setPreferences(prefs);

        const currentTypeApprovers =
          ApproverPreferencesHelper.getByTypeId(prefs, typeId);
        const approversArray: ApprovalAssignment[][] = [];
        const approverIdsArray: (number | null)[] = [];

        approverResponses.forEach((response, order) => {
          const apiOrder = order + 1;
          const items = response.items || [];
          approversArray.push(items);

          const savedApproverId = currentTypeApprovers[apiOrder] ?? null;
          if (savedApproverId && items.some((a) => a.userId === savedApproverId)) {
            approverIdsArray[order] = savedApproverId;
          } else {
            approverIdsArray[order] = null;
          }
        });

        setApprovers(approversArray);
        setApproverIds(approverIdsArray);
      } catch (err) {
        console.error('Failed to fetch approvers:', err);
        setApprovers([]);
        setApproverIds([]);
      } finally {
        setLoadingApprovers(false);
      }
    };

    fetchAll();
  }, [typeId, open, appToken, selectedType, userId, getApproverCount]);

  // Reset approverIds khi typeId thay đổi
  useEffect(() => {
    const prevTypeId = prevTypeIdRef.current;

    // Nếu typeId thay đổi, reset approverIds
    if (prevTypeId !== null && prevTypeId !== typeId) {
      setApproverIds([]);
    }

    // Cập nhật prevTypeIdRef
    prevTypeIdRef.current = typeId;
  }, [typeId]);

  // Helper để set approverId theo order (0-based)
  const setApproverId = useCallback(
    (order: number, approverId: number | null) => {
      setApproverIds((prev) => {
        const newIds = [...prev];
        newIds[order] = approverId;
        return newIds;
      });

      if (typeId && selectedType) {
        const apiOrder = order + 1;
        setPreferences((prev) => {
          const next = ApproverPreferencesHelper.set(
            prev,
            typeId,
            apiOrder,
            approverId,
          );
          applicationApi.saveApproverPreferences(next).catch(console.error);
          return next;
        });
      }
    },
    [typeId, selectedType],
  );

  // Tính toán thời gian tự động dựa trên typeId và calendarDay
  const calculateAutoTime = useCallback(
    (targetTypeId: number): { timeStart: string; timeEnd: string } => {
      const workStart = workingTime?.workStart || '08:30';
      const workEnd = workingTime?.workEnd || '17:30';

      if (targetTypeId === 2 && calendarDay) {
        // Đơn Vắng mặt - Thay đổi thời gian làm việc
        if (calendarDay.minutesLate > 0 && calendarDay.timeIn) {
          // Đi muộn: từ workStart đến tối đa 1 tiếng (hoặc timeIn nếu sớm hơn)
          const workStartTime = dayjs(`2000-01-01 ${workStart}`, 'YYYY-MM-DD HH:mm');
          const maxEndTime = workStartTime.add(60, 'minute');
          const timeInTime = dayjs(`2000-01-01 ${calendarDay.timeIn}`, 'YYYY-MM-DD HH:mm');
          const finalEndTime = timeInTime.isBefore(maxEndTime) ? timeInTime : maxEndTime;
          return {
            timeStart: workStart,
            timeEnd: finalEndTime.format('HH:mm'),
          };
        }
        if (calendarDay.minutesEarly > 0 && calendarDay.timeOut) {
          // Về sớm: từ tối đa 1 tiếng trước workEnd (hoặc timeOut nếu muộn hơn) đến workEnd
          const workEndTime = dayjs(`2000-01-01 ${workEnd}`, 'YYYY-MM-DD HH:mm');
          const minStartTime = workEndTime.subtract(60, 'minute');
          const timeOutTime = dayjs(`2000-01-01 ${calendarDay.timeOut}`, 'YYYY-MM-DD HH:mm');
          const finalStartTime = timeOutTime.isAfter(minStartTime) ? timeOutTime : minStartTime;
          return {
            timeStart: finalStartTime.format('HH:mm'),
            timeEnd: workEnd,
          };
        }
        // Xác định khoảng thời gian thiếu chấm công
        const missingRanges = getMissingTimeRanges(calendarDay, workingTime);
        if (missingRanges.length > 0) {
          return {
            timeStart: missingRanges[0].start,
            timeEnd: missingRanges[0].end,
          };
        }
        return { timeStart: workStart, timeEnd: workEnd };
      }

      if (targetTypeId === 1) {
        // Đơn Nghỉ phép
        if (calendarDay?.timeIn && calendarDay?.timeOut) {
          // Có chấm công -> không thể làm đơn cả ngày, cần xác định khoảng thời gian thiếu
          const missingRanges = getMissingTimeRanges(calendarDay, workingTime);
          if (missingRanges.length > 0) {
            return {
              timeStart: missingRanges[0].start,
              timeEnd: missingRanges[0].end,
            };
          }
          // Không có khoảng thiếu -> để trống
          return { timeStart: '', timeEnd: '' };
        }
        // Không có chấm công hoặc thiếu một phần -> có thể làm đơn cả ngày
        return { timeStart: workStart, timeEnd: workEnd };
      }

      return { timeStart: workStart, timeEnd: workEnd };
    },
    [calendarDay, workingTime],
  );

  // Helper function để tạo dayDetailMap
  const createDayDetailMap = useCallback((): Map<string, { applicationForms?: DayDetailApplicationForm[] }> => {
    const dayDetailMap = new Map<string, { applicationForms?: DayDetailApplicationForm[] }>();
    if (dayDetail?.applicationForms && !mergedDays) {
      const dayDate = dayjs(date);
      calendarDays?.forEach(({ date: dayDateItem }) => {
        const dateStr = dayjs(dayDateItem).format('YYYY-MM-DD');
        if (dayjs(dateStr).isSame(dayDate, 'day')) {
          dayDetailMap.set(dateStr, { applicationForms: dayDetail.applicationForms });
        }
      });
    }
    return dayDetailMap;
  }, [dayDetail, mergedDays, date, calendarDays]);

  // Hàm tập trung để tính toán warningMessage cho tất cả các trường hợp
  const getWarningMessage = useCallback((): string | null => {
    if (!open) return null;

    // 1. Kiểm tra overlap (ưu tiên cao nhất)
    if (timeStart && timeEnd) {
      const hasOverlap = checkOverlappingForms(
        timeStart,
        timeEnd,
        calendarDay,
        dayDetail,
      );
      if (hasOverlap) {
        return 'Ngày này đã có đơn trùng lặp thời gian. Vui lòng kiểm tra lại.';
      }
    }

    // 2. Kiểm tra quá hạn làm đơn
    const selectedDate = dayjs(date);
    const today = dayjs();
    const minDate = today.subtract(7, 'day'); // 7 ngày trước từ hôm nay
    if (selectedDate.isBefore(minDate, 'day')) {
      return 'Đã quá hạn làm đơn cho ngày này';
    }

    // 3. Kiểm tra đã có đơn vắng mặt trong tuần (chỉ khi typeId === 2)
    if (typeId === 2) {
      const dayDetailMap = createDayDetailMap();
      const hasAbsenceFormInWeek = checkAbsenceFormInWeek(date, calendarDays, dayDetailMap, mergedDays);
      if (hasAbsenceFormInWeek) {
        return 'Đã có 2 đơn vắng mặt (Thay đổi thời gian làm việc) trong tuần này. Một tuần chỉ có thể có tối đa 2 đơn vắng mặt. Vui lòng tạo đơn xin nghỉ phép thay thế.';
      }
    }

    return null;
  }, [open, timeStart, timeEnd, calendarDay, dayDetail, date, typeId, calendarDays, mergedDays, createDayDetailMap]);

  // Tính toán và set warningMessage khi các dependencies thay đổi
  useEffect(() => {
    const message = getWarningMessage();
    setWarningMessage(message);
  }, [getWarningMessage]);

  // Reset form khi mở dialog
  useEffect(() => {
    if (open) {
      setError(null);
      setValidationError(null);

      // Kiểm tra đã có đơn vắng mặt trong tuần chưa để quyết định typeId ban đầu
      const dayDetailMap = createDayDetailMap();
      const hasAbsenceFormInWeek = checkAbsenceFormInWeek(date, calendarDays, dayDetailMap, mergedDays);
      const initialTypeId = hasAbsenceFormInWeek ? 1 : 2;
      setTypeId(initialTypeId);

      // Tính toán thời gian tự động
      const autoTime = calculateAutoTime(initialTypeId);
      setTimeStart(autoTime.timeStart);
      setTimeEnd(autoTime.timeEnd);
    }
  }, [open, date, calendarDays, mergedDays, dayDetail, calculateAutoTime, createDayDetailMap]);

  // Tự động tính toán lại khi typeId thay đổi
  useEffect(() => {
    if (open) {
      // Tính toán lại thời gian
      const autoTime = calculateAutoTime(typeId);
      setTimeStart(autoTime.timeStart);
      setTimeEnd(autoTime.timeEnd);
    }
  }, [typeId, open, calculateAutoTime]);

  // Validation
  const validate = useCallback((): boolean => {
    setValidationError(null);

    // Kiểm tra thời hạn: chỉ cho phép tạo đơn trong vòng 7 ngày trở lại (từ hôm nay)
    const selectedDate = dayjs(date);
    const today = dayjs();
    const minDate = today.subtract(7, 'day'); // 7 ngày trước từ hôm nay

    // Chỉ cho phép tạo đơn từ hôm nay trở về 7 ngày
    // Warning message đã được xử lý bởi getWarningMessage
    if (selectedDate.isBefore(minDate, 'day')) {
      return false;
    }

    // Kiểm tra tất cả người duyệt đều được chọn
    if (selectedType) {
      const approverCount = getApproverCount(selectedType);
      for (let order = 0; order < approverCount; order++) {
        if (!approverIds[order]) {
          setValidationError(
            `Vui lòng chọn người duyệt ${order + 1}`,
          );
          return false;
        }
      }
    }

    // Kiểm tra đơn Nghỉ phép: nếu có chấm công thì không thể làm đơn cả ngày
    if (typeId === 1) {
      if (calendarDay && calendarDay.timeIn && calendarDay.timeOut) {
        const workStart = workingTime?.workStart || '08:30';
        const workEnd = workingTime?.workEnd || '17:30';
        const isFullDay =
          !timeStart || !timeEnd || (timeStart === workStart && timeEnd === workEnd);

        if (isFullDay) {
          setValidationError(
            'Không thể tạo đơn nghỉ phép cả ngày khi đã có chấm công. Vui lòng chọn khoảng thời gian cụ thể.',
          );
          return false;
        }
      }
    }

    // Kiểm tra đơn Vắng mặt - Thay đổi thời gian làm việc
    if (typeId === 2) {
      // Điều kiện: ngày đó phải làm đủ ít nhất 8 tiếng (thời gian hiệu quả = timeOut - timeIn - nghỉ trưa 1h - phút về sớm)
      const LUNCH_BREAK_MINUTES = 60; // 1 giờ nghỉ trưa không tính vào giờ làm
      if (calendarDay?.timeIn && calendarDay?.timeOut) {
        const timeInTime = dayjs(`2000-01-01 ${calendarDay.timeIn}`, 'YYYY-MM-DD HH:mm');
        const timeOutTime = dayjs(`2000-01-01 ${calendarDay.timeOut}`, 'YYYY-MM-DD HH:mm');
        const rawMinutes = timeOutTime.diff(timeInTime, 'minute');
        const minutesEarly = (calendarDay as { minutesEarly?: number }).minutesEarly ?? 0;
        const effectiveWorkMinutes = rawMinutes - LUNCH_BREAK_MINUTES - minutesEarly;
        const requiredWorkMinutes = 8 * 60; // 8 tiếng = 480 phút
        if (effectiveWorkMinutes < requiredWorkMinutes) {
          setValidationError(
            'Đơn Vắng mặt (Thay đổi thời gian làm việc) chỉ được tạo khi ngày đó làm đủ ít nhất 8 tiếng (sau khi trừ nghỉ trưa 1h và phần về sớm).',
          );
          return false;
        }
      }

      if (!timeStart || !timeEnd) {
        setValidationError('Vui lòng nhập thời gian bắt đầu và kết thúc');
        return false;
      }

      const calculatedMinutes = calculateMinutes(timeStart, timeEnd);
      if (calculatedMinutes === null) {
        setValidationError('Thời gian không hợp lệ');
        return false;
      }

      if (calculatedMinutes > 60) {
        setValidationError(
          'Đơn Vắng mặt - Thay đổi thời gian làm việc không được quá 60 phút',
        );
        return false;
      }

      if (calculatedMinutes <= 0) {
        setValidationError('Thời gian kết thúc phải sau thời gian bắt đầu');
        return false;
      }

      // Kiểm tra một tuần chỉ có 1 đơn Vắng mặt - Thay đổi thời gian làm việc
      // Tạo map từ dayDetail để kiểm tra pending forms (fallback nếu không có mergedDays)
      const dayDetailMap = new Map<string, { applicationForms?: DayDetailApplicationForm[] }>();
      if (dayDetail?.applicationForms && !mergedDays) {
        // Chỉ tạo map nếu không có mergedDays (mergedDays đã có data cho tất cả các ngày)
        const dayDate = dayjs(date);
        calendarDays?.forEach(({ date: dayDateItem }) => {
          const dateStr = dayjs(dayDateItem).format('YYYY-MM-DD');
          if (dayjs(dateStr).isSame(dayDate, 'day')) {
            dayDetailMap.set(dateStr, { applicationForms: dayDetail.applicationForms });
          }
        });
      }
      const hasAbsenceFormInWeek = checkAbsenceFormInWeek(date, calendarDays, dayDetailMap, mergedDays);
      if (hasAbsenceFormInWeek) {
        setValidationError(
          'Một tuần chỉ có thể có tối đa 2 đơn vắng mặt (Thay đổi thời gian làm việc). Vui lòng tạo đơn xin nghỉ phép thay thế.',
        );
        return false;
      }
    }

    return true;
  }, [date, typeId, timeStart, timeEnd, calendarDay, workingTime, calendarDays, mergedDays, selectedType, approverIds, dayDetail]);

  // Handle submit
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    if (!validate()) return false;

    if (!appToken) {
      setError('Chưa đăng nhập với HRM. Vui lòng đăng nhập.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedReason = reasons.find((r) => r.id === reasonId);
      const trackingTimeReasonId = selectedReason?.id || reasonId;

      // Tạo danh sách applicationApprovals
      const applicationApprovals: Array<{ userId: number; order: number }> =
        [];
      const approverCount = getApproverCount(selectedType);
      for (let order = 0; order < approverCount; order++) {
        const approverId = approverIds[order];
        if (approverId) {
          // API dùng 1-based order
          applicationApprovals.push({ userId: approverId, order: order + 1 });
        }
      }

      const payload: CreateApplicationFormPayload = {
        typeId,
        startDate: date,
        endDate: date,
        data: {
          reasonId: reasonId || undefined,
          trackingTimes:
            typeId === 2 && timeStart && timeEnd
              ? [
                  {
                    date,
                    timeStart,
                    timeEnd,
                    reasonId: trackingTimeReasonId || undefined,
                  },
                ]
              : typeId === 1
                ? [
                    {
                      dateStart: date,
                      dateEnd: date,
                      timeStart: timeStart || undefined,
                      timeEnd: timeEnd || undefined,
                      reasonId: trackingTimeReasonId || undefined,
                    },
                  ]
                : undefined,
        },
        applicationApprovals:
          applicationApprovals.length > 0 ? applicationApprovals : undefined,
        description: selectedType?.name || 'Đơn từ',
      };

      await applicationApi.createApplicationForm(payload);
      return true;
    } catch {
      setError('Lỗi khi tạo đơn từ');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validate, appToken, typeId, date, timeStart, timeEnd, reasonId, reasons, selectedType, approverIds, getApproverCount]);

  return {
    typeId,
    setTypeId,
    reasonId,
    setReasonId,
    approverIds,
    setApproverId,
    timeStart,
    setTimeStart,
    timeEnd,
    setTimeEnd,
    types,
    reasons,
    selectedType,
    availableReasons,
    selectedReason,
    selectedReasonDisplayName,
    approvers,
    loadingApprovers,
    loading,
    loadingTypes,
    error,
    validationError,
    warningMessage,
    minutes,
    handleSubmit,
    validate,
  };
}
