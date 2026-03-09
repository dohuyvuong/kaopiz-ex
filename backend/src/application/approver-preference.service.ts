import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApproverPreferences } from './types/approver-preference.types';

@Injectable()
export class ApproverPreferenceService {
  private readonly logger = new Logger(ApproverPreferenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy tất cả approver preferences của user
   */
  async getAll(userId: number): Promise<ApproverPreferences> {
    const rows = await this.prisma.approverPreference.findMany({
      where: { userId },
      select: { typeId: true, approvalOrder: true, approverUserId: true },
    });

    return rows.map((r) => ({
      typeId: r.typeId,
      order: r.approvalOrder,
      approverUserId: r.approverUserId,
    }));
  }

  /**
   * Lưu approver preferences (ghi đè toàn bộ)
   */
  async saveAll(
    userId: number,
    preferences: ApproverPreferences,
  ): Promise<ApproverPreferences> {
    this.logger.log(`Saving approver preferences for user ${userId}`);

    const items = preferences.filter(
      (p) =>
        typeof p.typeId === 'number' &&
        typeof p.order === 'number' &&
        typeof p.approverUserId === 'number',
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.approverPreference.deleteMany({ where: { userId } });

      if (items.length > 0) {
        await tx.approverPreference.createMany({
          data: items.map((p) => ({
            userId,
            typeId: p.typeId,
            approvalOrder: p.order,
            approverUserId: p.approverUserId,
          })),
        });
      }
    });

    return this.getAll(userId);
  }

  /**
   * Cập nhật một approver preference
   */
  async setApprover(
    userId: number,
    typeId: number,
    order: number,
    approverUserId: number | null,
  ): Promise<ApproverPreferences> {
    if (approverUserId === null) {
      await this.prisma.approverPreference.deleteMany({
        where: { userId, typeId, approvalOrder: order },
      });
    } else {
      await this.prisma.approverPreference.upsert({
        where: {
          userId_typeId_approvalOrder: {
            userId,
            typeId,
            approvalOrder: order,
          },
        },
        create: {
          userId,
          typeId,
          approvalOrder: order,
          approverUserId,
        },
        update: { approverUserId },
      });
    }
    return this.getAll(userId);
  }
}
