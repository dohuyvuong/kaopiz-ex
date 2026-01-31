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

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChecklistService))
    private readonly checklistService: ChecklistService,
    @Inject(forwardRef(() => ApplicationService))
    private readonly applicationService: ApplicationService,
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
   * Get pending actions for a user
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
   * Execute form creation (create application forms)
   */
  private async executeFormCreation(
    userId: number,
    payload: FormCreationPayload,
  ): Promise<void> {
    const { forms } = payload;
    if (!forms || !Array.isArray(forms)) {
      throw new BadRequestException('Invalid payload for auto-create-forms');
    }

    // Get user's HRM token
    const token = await this.systemTokenService.getToken(userId, 'hrm');
    if (!token) {
      throw new BadRequestException('HRM token not found for user');
    }

    // Create each form
    for (const form of forms) {
      try {
        const formDto: CreateApplicationFormDto = {
          typeId: form.typeId,
          startDate: form.startDate,
          endDate: form.endDate,
          data: form.data,
          applicationApprovals: form.applicationApprovals,
        };
        await this.applicationService.createApplicationForm(token, formDto);
        this.logger.log(
          `Created application form for startDate ${form.startDate}, type ${form.typeId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to create form for startDate ${form.startDate}:`,
          error,
        );
        // Continue with other forms even if one fails
      }
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
