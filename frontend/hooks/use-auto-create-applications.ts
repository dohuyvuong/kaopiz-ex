import { useState, useMemo, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useApplicationFormStore } from '@/lib/stores/application-form-store';
import { TimesheetDay } from '@/lib/types/timesheet';
import { applicationApi } from '@/lib/api/application';
import {
  calculateApplicationsToCreate,
  ApplicationToCreate,
  calculateMinutesFromForms,
} from '@/lib/utils/auto-create-applications';
import {
  CreateApplicationFormPayload,
  ApprovalAssignment,
} from '@/lib/types/application';

interface UseAutoCreateApplicationsProps {
  calendarDays: Array<{ date: Date; timesheet: TimesheetDay | null }>;
  workingTime: { workStart: string; workEnd: string } | null;
  userId?: number;
  mergedDays?: Map<string, TimesheetDay & { hasPendingForms?: boolean }>;
  summary?: {
    timelines: TimesheetDay[];
    summary: { minutesLate: number; minutesEarly: number };
  } | null;
}

interface UseAutoCreateApplicationsReturn {
  applications: ApplicationToCreate[];
  loading: boolean;
  error: string | null;
  calculateApplications: () => void;
  createApplications: () => Promise<void>;
  totalMinutesReduced: number;
  updateApplication: (index: number, app: ApplicationToCreate) => void;
  removeApplication: (index: number) => void;
  progress: {
    current: number;
    total: number;
    currentApp: ApplicationToCreate | null;
  };
  previewAfterApprove: {
    minutesLate: number;
    minutesEarly: number;
    total: number;
  };
  missingApprovers: Array<{
    typeId: number;
    typeName: string;
    missingOrders: number[];
  }>;
}

export function useAutoCreateApplications({
  calendarDays,
  workingTime,
  userId,
  mergedDays,
  summary,
}: UseAutoCreateApplicationsProps): UseAutoCreateApplicationsReturn {
  const appToken = useAuthStore((state) => state.appToken);
  const savedApprovers = useApplicationFormStore((state) => state.approvers);
  const [applications, setApplications] = useState<ApplicationToCreate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    currentApp: ApplicationToCreate | null;
  }>({
    current: 0,
    total: 0,
    currentApp: null,
  });

  const totalMinutesReduced = useMemo(() => {
    return applications.reduce((sum, app) => sum + app.minutes, 0);
  }, [applications]);

  // Tính toán Preview sau khi tất cả đơn được approve (bao gồm pending và sẽ tạo)
  const previewAfterApprove = useMemo(() => {
    if (!summary) {
      return {
        minutesLate: 0,
        minutesEarly: 0,
        total: 0,
      };
    }

    let totalMinutesLate = summary.summary.minutesLate;
    let totalMinutesEarly = summary.summary.minutesEarly;

    // Trừ đi số phút từ các đơn pending (đã có trong mergedDays)
    mergedDays?.forEach((day) => {
      if (day.hasPendingForms && day.approvedApplicationForms) {
        // Lấy các đơn pending: tất cả đơn trong mergedDay trừ đi các đơn đã approved từ timesheet
        const dayTimesheet = calendarDays.find(
          (d) => dayjs(d.date).format('YYYY-MM-DD') === dayjs(day.date).format('YYYY-MM-DD'),
        )?.timesheet;
        const approvedFormIds = new Set(
          (dayTimesheet?.approvedApplicationForms || []).map((f) => f.id),
        );
        const pendingForms = day.approvedApplicationForms.filter(
          (form) =>
            (form.typeId === 1 || form.typeId === 2) &&
            !approvedFormIds.has(form.id),
        );
        const pendingMinutes = calculateMinutesFromForms(pendingForms);

        // Phân bổ pendingMinutes cho late và early dựa trên tỷ lệ
        const dayTotal = (day.minutesLate || 0) + (day.minutesEarly || 0);
        if (dayTotal > 0) {
          const lateRatio = (day.minutesLate || 0) / dayTotal;
          const earlyRatio = (day.minutesEarly || 0) / dayTotal;
          totalMinutesLate = Math.max(0, totalMinutesLate - Math.round(pendingMinutes * lateRatio));
          totalMinutesEarly = Math.max(0, totalMinutesEarly - Math.round(pendingMinutes * earlyRatio));
        }
      }
    });

    // Trừ đi số phút từ các đơn sẽ tạo
    applications.forEach((app) => {
      const day = calendarDays.find(
        (d) => dayjs(d.date).format('YYYY-MM-DD') === app.date,
      );
      if (!day?.timesheet) return;

      const isLate = app.description.includes('đi muộn');
      const isEarly = app.description.includes('về sớm');

      if (isLate && day.timesheet.minutesLate > 0) {
        const minutesCovered = Math.min(app.minutes, day.timesheet.minutesLate);
        totalMinutesLate = Math.max(0, totalMinutesLate - minutesCovered);
      } else if (isEarly && day.timesheet.minutesEarly > 0) {
        const minutesCovered = Math.min(app.minutes, day.timesheet.minutesEarly);
        totalMinutesEarly = Math.max(0, totalMinutesEarly - minutesCovered);
      } else if (!isLate && !isEarly) {
        // Đơn cả ngày - phân bổ theo tỷ lệ
        const dayTotal = (day.timesheet.minutesLate || 0) + (day.timesheet.minutesEarly || 0);
        if (dayTotal > 0) {
          const lateRatio = (day.timesheet.minutesLate || 0) / dayTotal;
          const earlyRatio = (day.timesheet.minutesEarly || 0) / dayTotal;
          totalMinutesLate = Math.max(0, totalMinutesLate - Math.round(app.minutes * lateRatio));
          totalMinutesEarly = Math.max(0, totalMinutesEarly - Math.round(app.minutes * earlyRatio));
        }
      }
    });

    return {
      minutesLate: totalMinutesLate,
      minutesEarly: totalMinutesEarly,
      total: totalMinutesLate + totalMinutesEarly,
    };
  }, [summary, mergedDays, calendarDays, applications]);

  // Kiểm tra thiếu người duyệt
  const [types, setTypes] = useState<Array<{ id: number; name: string; orderMax: number }>>([]);

  // Fetch types để kiểm tra người duyệt
  useEffect(() => {
    if (applications.length > 0) {
      applicationApi.getFormTypes().then((response) => {
        setTypes(response.items || []);
      }).catch(() => {
        setTypes([]);
      });
    } else {
      setTypes([]);
    }
  }, [appToken, applications.length]);

  const missingApprovers = useMemo(() => {
    if (!appToken || !userId || applications.length === 0 || types.length === 0) {
      return [];
    }

    const missing: Array<{
      typeId: number;
      typeName: string;
      missingOrders: number[];
    }> = [];

    const uniqueTypeIds = [...new Set(applications.map((app) => app.typeId))];

    for (const typeId of uniqueTypeIds) {
      const type = types.find((t) => t.id === typeId);
      if (!type) continue;

      const savedTypeApprovers = savedApprovers[typeId] || {};
      const missingOrders: number[] = [];

      for (let order = 1; order <= type.orderMax; order++) {
        if (!savedTypeApprovers[order]) {
          missingOrders.push(order);
        }
      }

      if (missingOrders.length > 0) {
        missing.push({
          typeId,
          typeName: type.name,
          missingOrders,
        });
      }
    }

    return missing;
  }, [appToken, userId, applications, types, savedApprovers]);

  const calculateApplications = useCallback(() => {
    if (!workingTime) {
      setError('Chưa có thông tin giờ làm việc');
      return;
    }

    try {
      const apps = calculateApplicationsToCreate(
        calendarDays,
        workingTime,
        90,
        mergedDays,
      );
      setApplications(apps);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Lỗi khi tính toán các đơn cần tạo',
      );
    }
  }, [calendarDays, workingTime, mergedDays]);

  const updateApplication = useCallback(
    (index: number, app: ApplicationToCreate) => {
      setApplications((prev) => {
        const updated = [...prev];
        updated[index] = app;
        return updated;
      });
    },
    [],
  );

  const removeApplication = useCallback((index: number) => {
    setApplications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const createApplications = useCallback(async () => {
    if (!appToken) {
      setError('Chưa đăng nhập với HRM. Vui lòng đăng nhập.');
      return;
    }

    if (!userId) {
      setError('Chưa có thông tin người dùng');
      return;
    }

    if (applications.length === 0) {
      setError('Không có đơn nào để tạo');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress({
      current: 0,
      total: applications.length,
      currentApp: null,
    });

    try {
      // 1. Fetch types
      const typesResponse = await applicationApi.getFormTypes();
      const types = typesResponse.items || [];

      // 2. Fetch approvers cho từng typeId (unique)
      const uniqueTypeIds = [...new Set(applications.map((app) => app.typeId))];
      const approversMap: Record<
        number,
        Record<number, ApprovalAssignment[]>
      > = {};

      for (const typeId of uniqueTypeIds) {
        const type = types.find((t) => t.id === typeId);
        if (!type) continue;

        approversMap[typeId] = {};
        for (let order = 1; order <= type.orderMax; order++) {
          const approversResponse =
            await applicationApi.getApprovalAssignments(
              typeId,
              order,
              userId,
            );
          approversMap[typeId][order] = approversResponse.items || [];
        }
      }

      // 3. Tạo từng đơn với progress tracking
      for (let i = 0; i < applications.length; i++) {
        const app = applications[i];
        setProgress({
          current: i + 1,
          total: applications.length,
          currentApp: app,
        });

        const type = types.find((t) => t.id === app.typeId);
        if (!type) {
          throw new Error(`Không tìm thấy loại đơn với typeId: ${app.typeId}`);
        }

        // Lấy approvers đã lưu từ Redux cho type này
        const savedTypeApprovers = savedApprovers[app.typeId] || {};
        const applicationApprovals: Array<{ userId: number; order: number }> =
          [];

        // Kiểm tra xem có đủ approvers đã lưu không
        for (let order = 1; order <= type.orderMax; order++) {
          const savedApproverId = savedTypeApprovers[order];
          if (savedApproverId) {
            // Kiểm tra approver này có trong danh sách không
            const availableApprovers = approversMap[app.typeId]?.[order] || [];
            const isValid = availableApprovers.some(
              (a) => a.userId === savedApproverId,
            );
            if (isValid) {
              applicationApprovals.push({
                userId: savedApproverId,
                order,
              });
            }
          }
        }

        // Nếu không có đủ approvers, bỏ qua đơn này và báo lỗi
        if (applicationApprovals.length < type.orderMax) {
          throw new Error(
            `Thiếu người duyệt cho đơn ngày ${app.date}. Vui lòng chọn người duyệt trước.`,
          );
        }

        const payload: CreateApplicationFormPayload = {
          typeId: app.typeId,
          startDate: app.date,
          endDate: app.date,
          data: {
            reasonId: app.reasonId,
            trackingTimes:
              app.typeId === 2
                ? [
                    {
                      date: app.date,
                      timeStart: app.timeStart,
                      timeEnd: app.timeEnd,
                      reasonId: app.reasonId,
                    },
                  ]
                : [
                    {
                      dateStart: app.date,
                      dateEnd: app.date,
                      timeStart: app.timeStart,
                      timeEnd: app.timeEnd,
                      reasonId: app.reasonId,
                    },
                  ],
          },
          applicationApprovals:
            applicationApprovals.length > 0
              ? applicationApprovals
              : undefined,
          description: app.description,
        };

        await applicationApi.createApplicationForm(payload);
      }

      // 4. Reset applications sau khi tạo thành công
      setApplications([]);
      setProgress({
        current: 0,
        total: 0,
        currentApp: null,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Lỗi khi tạo các đơn. Vui lòng thử lại.',
      );
      setProgress({
        current: 0,
        total: 0,
        currentApp: null,
      });
    } finally {
      setLoading(false);
    }
  }, [appToken, userId, applications, savedApprovers]);

  return {
    applications,
    loading,
    error,
    calculateApplications,
    createApplications,
    totalMinutesReduced,
    updateApplication,
    removeApplication,
    progress,
    previewAfterApprove,
    missingApprovers,
  };
}
