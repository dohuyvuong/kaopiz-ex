import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setApprover } from '@/lib/features/application-form/applicationFormSlice';
import { applicationApi } from '@/lib/api/application';
import {
  CreateApplicationFormPayload,
  ApplicationFormType,
  ApplicationFormReason,
  ApprovalAssignment,
} from '@/lib/types/application';
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
  handleSubmit: () => Promise<void>;
  validate: () => boolean;
}


export function useCreateApplicationForm({
  open,
  date,
  calendarDay,
  workingTime,
  calendarDays,
  dayDetail,
  userId,
}: UseCreateApplicationFormProps): UseCreateApplicationFormReturn {
  const dispatch = useAppDispatch();
  const hrmToken = useAppSelector(
    (state) => state.auth.tokens.hrm?.token,
  );
  const savedApprovers = useAppSelector(
    (state) => state.applicationForm.approvers,
  );

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
    if (open && hrmToken) {
      const fetchTypes = async () => {
        setLoadingTypes(true);
        try {
          // Fetch types
          const typesResponse = await applicationApi.getFormTypes(hrmToken);
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
  }, [open, hrmToken]);

  // Fetch reasons khi typeId thay đổi
  useEffect(() => {
    if (open && hrmToken && typeId) {
      const fetchReasons = async () => {
        try {
          const reasonsResponse = await applicationApi.getReasons(
            hrmToken,
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
  }, [typeId, open, hrmToken, calendarDay]);

  // Số lượng người duyệt cho từng loại đơn (orderMax = số lượng người duyệt)
  const getApproverCount = useCallback((type: ApplicationFormType | null): number => {
    if (!type) return 0;
    // orderMax là số lượng người duyệt (1-based), nhưng chúng ta dùng 0-based index
    return type.orderMax;
  }, []);

  // Fetch người duyệt khi typeId thay đổi
  useEffect(() => {
    if (open && hrmToken && typeId && selectedType && userId) {
      const fetchApprovers = async () => {
        setLoadingApprovers(true);
        try {
          const approverCount = getApproverCount(selectedType);
          const approversArray: ApprovalAssignment[][] = [];
          const approverIdsArray: (number | null)[] = [];

          // Lấy saved approvers cho typeId hiện tại (chỉ đọc một lần)
          const currentTypeApprovers = savedApprovers[typeId] || {};

          // Loop từ 0 đến approverCount - 1
          for (let order = 0; order < approverCount; order++) {
            // API dùng 1-based order, nên order + 1
            const apiOrder = order + 1;
            const approversResponse =
              await applicationApi.getApprovalAssignments(
                hrmToken,
                typeId,
                apiOrder,
                userId,
              );
            approversArray.push(approversResponse.items || []);

            // Load người duyệt đã lưu từ Redux state
            const savedApproverId = currentTypeApprovers[apiOrder] ?? null;
            if (savedApproverId) {
              const exists = approversResponse.items?.some(
                (a) => a.userId === savedApproverId,
              );
              if (exists) {
                approverIdsArray[order] = savedApproverId;
              } else {
                approverIdsArray[order] = null;
              }
            } else {
              approverIdsArray[order] = null;
            }
          }

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

      fetchApprovers();
    } else {
      setApprovers([]);
      setApproverIds([]);
    }
  }, [typeId, open, hrmToken, selectedType, userId, getApproverCount]);

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

      // Lưu ngay vào Redux khi user thay đổi
      if (typeId && selectedType) {
        dispatch(
          setApprover({
            typeId,
            order: order + 1, // API dùng 1-based order
            userId: approverId,
          }),
        );
      }
    },
    [typeId, selectedType, dispatch],
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

  // Reset form khi mở dialog
  useEffect(() => {
    if (open) {
      setError(null);
      setValidationError(null);
      setWarningMessage(null);

      // Kiểm tra đã có đơn vắng mặt trong tuần chưa
      const hasAbsenceFormInWeek = checkAbsenceFormInWeek(date, calendarDays);
      const initialTypeId = hasAbsenceFormInWeek ? 1 : 2;
      setTypeId(initialTypeId);

      // Tính toán thời gian tự động
      const autoTime = calculateAutoTime(initialTypeId);
      setTimeStart(autoTime.timeStart);
      setTimeEnd(autoTime.timeEnd);
    }
  }, [open, date, calendarDays, calculateAutoTime]);

  // Tự động tính toán lại khi typeId thay đổi
  useEffect(() => {
    if (open) {
      // Kiểm tra và hiển thị cảnh báo khi chuyển sang đơn vắng mặt
      if (typeId === 2) {
        const hasAbsenceFormInWeek = checkAbsenceFormInWeek(date, calendarDays);
        if (hasAbsenceFormInWeek) {
          setWarningMessage(
            'Đã có đơn vắng mặt (Thay đổi thời gian làm việc) trong tuần này. Một tuần chỉ có thể có 1 đơn vắng mặt. Vui lòng tạo đơn xin nghỉ phép thay thế.',
          );
        } else {
          setWarningMessage(null);
        }
      } else {
        setWarningMessage(null);
      }

      // Tính toán lại thời gian
      const autoTime = calculateAutoTime(typeId);
      setTimeStart(autoTime.timeStart);
      setTimeEnd(autoTime.timeEnd);
    }
  }, [typeId, open, date, calendarDays, calculateAutoTime]);

  // Kiểm tra và cập nhật cảnh báo overlap
  useEffect(() => {
    if (open && timeStart && timeEnd) {
      // Kiểm tra overlap với các đơn đã có trong ngày
      const hasOverlap = checkOverlappingForms(
        timeStart,
        timeEnd,
        calendarDay,
        dayDetail,
      );
      if (hasOverlap) {
        setWarningMessage(
          'Ngày này đã có đơn trùng lặp thời gian. Vui lòng kiểm tra lại.',
        );
        return;
      }

      // Kiểm tra và hiển thị cảnh báo khi chuyển sang đơn vắng mặt
      if (typeId === 2) {
        const hasAbsenceFormInWeek = checkAbsenceFormInWeek(date, calendarDays);
        if (hasAbsenceFormInWeek) {
          setWarningMessage(
            'Đã có đơn vắng mặt (Thay đổi thời gian làm việc) trong tuần này. Một tuần chỉ có thể có 1 đơn vắng mặt. Vui lòng tạo đơn xin nghỉ phép thay thế.',
          );
        } else {
          setWarningMessage(null);
        }
      } else {
        setWarningMessage(null);
      }
    }
  }, [open, timeStart, timeEnd, typeId, calendarDay, calendarDays, date, dayDetail]);

  // Validation
  const validate = useCallback((): boolean => {
    setValidationError(null);

    // Kiểm tra thời hạn: không được quá 1 tuần
    const selectedDate = dayjs(date);
    const today = dayjs();
    const daysDiff = today.diff(selectedDate, 'day');
    if (daysDiff > 7) {
      setValidationError(
        'Đơn chỉ có thể được tạo trong vòng 1 tuần kể từ ngày áp dụng',
      );
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
      const hasAbsenceFormInWeek = checkAbsenceFormInWeek(date, calendarDays);
      if (hasAbsenceFormInWeek) {
        setValidationError(
          'Một tuần chỉ có thể có 1 đơn vắng mặt (Thay đổi thời gian làm việc). Vui lòng tạo đơn xin nghỉ phép thay thế.',
        );
        return false;
      }
    }

    return true;
  }, [date, typeId, timeStart, timeEnd, calendarDay, workingTime, calendarDays]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    if (!hrmToken) {
      setError('Chưa đăng nhập với HRM. Vui lòng đăng nhập.');
      return;
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

      await applicationApi.createApplicationForm(hrmToken, payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Lỗi khi tạo đơn từ',
      );
    } finally {
      setLoading(false);
    }
  }, [validate, hrmToken, typeId, date, timeStart, timeEnd, reasonId, reasons, selectedType, approverIds, getApproverCount]);

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
