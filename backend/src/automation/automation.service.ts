import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChecklistService } from '../checklist/checklist.service';
import { ApplicationService } from '../application/application.service';
import { SystemTokenService } from '../auth/services/system-token.service';
import { UpdateAutomationSettingDto } from './dto/automation-setting.dto';
import {
  JobType,
  PendingActionStatus,
  ChecklistReviewStatus,
  AUTO_APPROVE_COMMENT,
} from './constants/automation.constants';
import {
  ChecklistReviewPayload,
  FormCreationPayload,
} from './interfaces/pending-action-payload.interface';
import { SubmitReviewPayloadDto } from '../checklist/dto/checklist-api.dto';
import { CreateApplicationFormDto } from '../application/dto/create-application-form.dto';
import { ApproverPreferenceService } from '../application/approver-preference.service';
import { FormType } from '@kaopiz/timesheet';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChecklistService))
    private readonly checklistService: ChecklistService,
    @Inject(forwardRef(() => ApplicationService))
    private readonly applicationService: ApplicationService,
    private readonly approverPreferenceService: ApproverPreferenceService,
    private readonly systemTokenService: SystemTokenService,
  ) {}

  /**
   * Get automation setting for a user and jobType
   */
  async getSetting(userId: number, jobType: string) {
    const setting = await this.prisma.userAutomationSetting.findUnique({
      where: {
        userId_jobType: {
          userId,
          jobType,
        },
      },
    });

    if (!setting) {
      // Return default values if not found
      return {
        jobType,
        enabled: false,
        params: null,
        notificationChannel: null,
        notificationTarget: null,
        autoApproveAfterMinutes: null,
      };
    }

    return {
      id: setting.id,
      jobType: setting.jobType,
      enabled: setting.enabled,
      params: setting.params ? JSON.parse(setting.params) : null,
      notificationChannel: setting.notificationChannel,
      notificationTarget: setting.notificationTarget,
      autoApproveAfterMinutes: setting.autoApproveAfterMinutes,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }

  /**
   * Get all automation settings for a user
   */
  async getAllSettings(userId: number) {
    const settings = await this.prisma.userAutomationSetting.findMany({
      where: { userId },
    });

    const jobTypes = ['auto-review-checklist', 'auto-create-forms'];
    const result = jobTypes.map((jobType) => {
      const setting = settings.find((s) => s.jobType === jobType);
      if (setting) {
        return {
          id: setting.id,
          jobType: setting.jobType,
          enabled: setting.enabled,
          params: setting.params ? JSON.parse(setting.params) : null,
          notificationChannel: setting.notificationChannel,
          notificationTarget: setting.notificationTarget,
          autoApproveAfterMinutes: setting.autoApproveAfterMinutes,
          createdAt: setting.createdAt,
          updatedAt: setting.updatedAt,
        };
      }
      // Return default values if not found
      return {
        jobType,
        enabled: false,
        params: null,
        notificationChannel: null,
        notificationTarget: null,
        autoApproveAfterMinutes: null,
      };
    });

    return result;
  }

  /**
   * Update automation setting for a user and jobType
   */
  async updateSetting(
    userId: number,
    jobType: string,
    dto: UpdateAutomationSettingDto,
  ) {
    this.logger.log(
      `Updating automation setting for user ${userId}, jobType ${jobType}`,
    );

    const setting = await this.prisma.userAutomationSetting.upsert({
      where: {
        userId_jobType: {
          userId,
          jobType,
        },
      },
      create: {
        userId,
        jobType,
        enabled: dto.enabled,
        params: dto.params ? JSON.stringify(dto.params) : null,
        notificationChannel: dto.notificationChannel,
        notificationTarget: dto.notificationTarget,
        autoApproveAfterMinutes: dto.autoApproveAfterMinutes,
      },
      update: {
        enabled: dto.enabled,
        params: dto.params ? JSON.stringify(dto.params) : null,
        notificationChannel: dto.notificationChannel,
        notificationTarget: dto.notificationTarget,
        autoApproveAfterMinutes: dto.autoApproveAfterMinutes,
      },
    });

    this.logger.log(
      `Automation setting updated: ${setting.id}, enabled: ${setting.enabled}`,
    );

    return {
      id: setting.id,
      jobType: setting.jobType,
      enabled: setting.enabled,
      params: setting.params ? JSON.parse(setting.params) : null,
      notificationChannel: setting.notificationChannel,
      notificationTarget: setting.notificationTarget,
      autoApproveAfterMinutes: setting.autoApproveAfterMinutes,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }

  /**
   * Get pending actions for a user (status = pending only)
   */
  async getPendingActions(userId: number) {
    const actions = await this.prisma.pendingAction.findMany({
      where: {
        userId,
        status: 'pending',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.mapActions(actions);
  }

  /**
   * Get all actions for a user (all statuses)
   */
  async getAllActions(userId: number) {
    const actions = await this.prisma.pendingAction.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.mapActions(actions);
  }

  private mapActions(
    actions: Array<{
      id: number;
      jobType: string;
      payload: string;
      status: string;
      notifiedAt: Date | null;
      expiresAt: Date;
      createdAt: Date;
    }>,
  ) {
    return actions.map((action) => ({
      id: action.id,
      jobType: action.jobType,
      payload: JSON.parse(action.payload),
      status: action.status,
      notifiedAt: action.notifiedAt,
      expiresAt: action.expiresAt,
      createdAt: action.createdAt,
    }));
  }

  /**
   * Get one pending action by id (chỉ trả về nếu thuộc user)
   */
  async getActionById(userId: number, actionId: number) {
    const action = await this.prisma.pendingAction.findFirst({
      where: {
        id: actionId,
        userId,
      },
    });
    if (!action) {
      throw new NotFoundException('Pending action not found');
    }
    return this.mapActions([action])[0];
  }

  /**
   * Approve a pending action and execute it
   */
  async approvePendingAction(userId: number, actionId: number) {
    this.logger.log(`Approving pending action ${actionId} for user ${userId}`);

    // Find the pending action
    const action = await this.prisma.pendingAction.findUnique({
      where: { id: actionId },
    });

    if (!action) {
      throw new NotFoundException('Pending action not found');
    }

    if (action.userId !== userId) {
      throw new BadRequestException('This action does not belong to you');
    }

    if (action.status !== PendingActionStatus.PENDING) {
      throw new BadRequestException(
        `Action already ${action.status}. Cannot approve.`,
      );
    }

    // Update status to approved
    await this.prisma.pendingAction.update({
      where: { id: actionId },
      data: {
        status: PendingActionStatus.APPROVED,
        approvedAt: new Date(),
      },
    });

    // Execute the action
    try {
      const payload = JSON.parse(action.payload);
      await this.executeAction(userId, action.jobType as JobType, payload);

      await this.prisma.pendingAction.update({
        where: { id: actionId },
        data: {
          executedAt: new Date(),
        },
      });

      this.logger.log(`Pending action ${actionId} approved and executed`);
    } catch (error) {
      this.logger.error(`Error executing approved action ${actionId}:`, error);
      await this.prisma.pendingAction.update({
        where: { id: actionId },
        data: {
          error: error.message || 'Unknown error',
        },
      });
      throw error;
    }

    return { success: true, message: 'Action approved and executed' };
  }

  /**
   * Reject a pending action
   */
  async rejectPendingAction(userId: number, actionId: number) {
    this.logger.log(`Rejecting pending action ${actionId} for user ${userId}`);

    // Find the pending action
    const action = await this.prisma.pendingAction.findUnique({
      where: { id: actionId },
    });

    if (!action) {
      throw new NotFoundException('Pending action not found');
    }

    if (action.userId !== userId) {
      throw new BadRequestException('This action does not belong to you');
    }

    if (action.status !== PendingActionStatus.PENDING) {
      throw new BadRequestException(
        `Action already ${action.status}. Cannot reject.`,
      );
    }

    // Update status to rejected
    await this.prisma.pendingAction.update({
      where: { id: actionId },
      data: {
        status: PendingActionStatus.REJECTED,
      },
    });

    this.logger.log(`Pending action ${actionId} rejected`);

    return { success: true, message: 'Action rejected' };
  }

  /**
   * Find expired pending actions that need auto-approval
   */
  async findExpiredPendingActions() {
    const now = new Date();

    const expiredActions = await this.prisma.pendingAction.findMany({
      where: {
        status: PendingActionStatus.PENDING,
        expiresAt: {
          lt: now,
        },
      },
      include: {
        user: true,
      },
    });

    return expiredActions;
  }

  /**
   * Execute action based on jobType and payload
   */
  private async executeAction(
    userId: number,
    jobType: JobType,
    payload: ChecklistReviewPayload | FormCreationPayload,
  ): Promise<void> {
    this.logger.log(`Executing action for user ${userId}, jobType: ${jobType}`);

    if (jobType === JobType.AUTO_REVIEW_CHECKLIST) {
      await this.executeChecklistReview(
        userId,
        payload as ChecklistReviewPayload,
      );
    } else if (jobType === JobType.AUTO_CREATE_FORMS) {
      await this.executeFormCreation(userId, payload as FormCreationPayload);
    } else {
      throw new BadRequestException(`Unknown jobType: ${jobType}`);
    }
  }

  /**
   * Execute checklist review (submit reviews)
   */
  private async executeChecklistReview(
    userId: number,
    payload: ChecklistReviewPayload,
  ): Promise<void> {
    const { checklists } = payload;
    if (!checklists || !Array.isArray(checklists)) {
      throw new BadRequestException(
        'Invalid payload for auto-review-checklist',
      );
    }

    // Get user's Ksystem token
    const token = await this.systemTokenService.getToken(userId, 'ksystem');
    if (!token) {
      throw new BadRequestException('Ksystem token not found for user');
    }

    // Submit each review
    for (const checklist of checklists) {
      try {
        // Get checklist details to construct proper payload
        const details = await this.checklistService.getCodeReviewDetail(
          token,
          checklist.id,
        );

        // Construct submit review payload
        const submitPayload: SubmitReviewPayloadDto = {
          codeReview: {
            id: checklist.id,
            status: ChecklistReviewStatus.PASSED,
            reviewedAt: new Date(),
          },
          codeReviewDetails: details.codeReviewItems.map((item) => ({
            id: item.id,
            status: ChecklistReviewStatus.PASSED,
            comment: AUTO_APPROVE_COMMENT,
            codeReviewId: checklist.id,
            reviewResults: item.reviewResults.map((result) => ({
              checklistItemId: result.checklistItemId,
              authorReviewStatus: ChecklistReviewStatus.PASSED,
              reviewers: result.reviewers.map((reviewer) => ({
                reviewerId: reviewer.reviewerId,
                status: ChecklistReviewStatus.PASSED,
              })),
              note: AUTO_APPROVE_COMMENT,
              authorId: result.authorId || 0,
            })),
          })),
        };

        await this.checklistService.submitReview(
          token,
          checklist.id,
          submitPayload,
        );
        this.logger.log(`Submitted review for checklist ${checklist.id}`);
      } catch (error) {
        this.logger.error(
          `Failed to submit review for checklist ${checklist.id}:`,
          error,
        );
        // Continue with other reviews even if one fails
      }
    }
  }

  /**
   * Tạo các đơn đã được đề xuất.
   *
   * Người duyệt được tra tại ĐÂY chứ không lưu sẵn trong payload: khoảng cách
   * giữa lúc gửi thông báo và lúc người dùng bấm duyệt có thể vài giờ, đủ để
   * người dùng đổi lựa chọn người duyệt.
   */
  private async executeFormCreation(
    userId: number,
    payload: FormCreationPayload,
  ): Promise<void> {
    const { forms } = payload;
    if (!forms || !Array.isArray(forms) || forms.length === 0) {
      throw new BadRequestException('Invalid payload for auto-create-forms');
    }

    const token = await this.systemTokenService.getToken(userId, 'hrm');
    if (!token) {
      throw new BadRequestException('HRM token not found for user');
    }

    const [types, preferences] = await Promise.all([
      this.applicationService.getFormTypes(token),
      this.approverPreferenceService.getAll(userId),
    ]);

    // Người duyệt đã lưu có thể đã nghỉ việc hoặc đổi phòng ban trong khoảng
    // thời gian từ lúc gửi thông báo tới lúc duyệt. Đối chiếu trước để báo lỗi
    // rõ ràng thay vì để HRM từ chối giữa chừng.
    const validApprovers = new Map<string, number[]>();
    try {
      const usedTypeIds = [...new Set(forms.map((form) => form.typeId))];
      for (const typeId of usedTypeIds) {
        const type = types.items?.find((item) => item.id === typeId);
        for (let order = 1; order <= (type?.orderMax ?? 0); order += 1) {
          const response = await this.applicationService.getApprovalAssignments(
            token,
            typeId,
            order,
            userId,
          );
          validApprovers.set(
            `${typeId}|${order}`,
            (response.items ?? []).map((item) => item.userId),
          );
        }
      }
    } catch (error) {
      // API phụ lỗi thì bỏ bước đối chiếu, vẫn gửi và để HRM phán.
      this.logger.warn(
        `Không lấy được danh sách người duyệt: ${String(error)}`,
      );
      validApprovers.clear();
    }

    const failures: string[] = [];

    for (const form of forms) {
      try {
        const type = types.items?.find((item) => item.id === form.typeId);
        const orderMax = type?.orderMax ?? 0;
        const approvals = preferences
          .filter(
            (preference) =>
              preference.typeId === form.typeId &&
              preference.order <= orderMax &&
              preference.approverUserId != null,
          )
          .map((preference) => ({
            userId: preference.approverUserId,
            order: preference.order,
          }));

        for (const approval of approvals) {
          const valid = validApprovers.get(`${form.typeId}|${approval.order}`);
          if (valid && !valid.includes(approval.userId)) {
            throw new Error(
              `người duyệt ${approval.order} đã lưu không còn trong danh sách được duyệt`,
            );
          }
        }

        if (approvals.length < orderMax) {
          throw new Error(
            `chưa chọn đủ người duyệt cho "${type?.name ?? form.typeId}"`,
          );
        }

        // Đơn xin nghỉ dùng dateStart/dateEnd, các loại khác dùng date — đúng
        // shape HRM chờ đợi cho từng loại.
        const trackingTime =
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

        const formDto: CreateApplicationFormDto = {
          typeId: form.typeId,
          startDate: form.date,
          endDate: form.date,
          data: { reasonId: form.reasonId, trackingTimes: [trackingTime] },
          applicationApprovals: approvals,
          description: form.description,
        };

        await this.applicationService.createApplicationForm(token, formDto);
        this.logger.log(
          `Created ${form.typeId === FormType.LEAVE ? 'leave' : 'absence'} form for ${form.date} ` +
            `(${form.timeStart}-${form.timeEnd}, ${form.minutes}m)`,
        );
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        failures.push(
          `${form.date} ${form.timeStart}-${form.timeEnd}: ${reason}`,
        );
        this.logger.error(`Failed to create form for ${form.date}:`, error);
      }
    }

    // Tạo được đơn nào hay không vẫn phải báo lại: im lặng nuốt lỗi thì người
    // dùng tưởng đã xong và cuối tháng mới phát hiện bị phạt.
    if (failures.length === forms.length) {
      throw new BadRequestException(
        `Không tạo được đơn nào. ${failures.join('; ')}`,
      );
    }
    if (failures.length > 0) {
      this.logger.warn(
        `Tạo được ${forms.length - failures.length}/${forms.length} đơn. Lỗi: ${failures.join('; ')}`,
      );
    }
  }

  /**
   * Auto-approve and execute expired pending action
   */
  async autoApproveExpiredAction(actionId: number) {
    this.logger.log(`Auto-approving expired action ${actionId}`);

    const action = await this.prisma.pendingAction.findUnique({
      where: { id: actionId },
    });

    if (!action || action.status !== PendingActionStatus.PENDING) {
      return;
    }

    // Update status to auto_approved
    await this.prisma.pendingAction.update({
      where: { id: actionId },
      data: {
        status: PendingActionStatus.AUTO_APPROVED,
        approvedAt: new Date(),
      },
    });

    // Execute the action
    try {
      const payload = JSON.parse(action.payload);
      await this.executeAction(
        action.userId,
        action.jobType as JobType,
        payload,
      );

      await this.prisma.pendingAction.update({
        where: { id: actionId },
        data: {
          executedAt: new Date(),
        },
      });

      this.logger.log(`Expired action ${actionId} auto-approved and executed`);
    } catch (error) {
      this.logger.error(
        `Error executing auto-approved action ${actionId}:`,
        error,
      );
      await this.prisma.pendingAction.update({
        where: { id: actionId },
        data: {
          error: error.message || 'Unknown error',
        },
      });
    }
  }
}
