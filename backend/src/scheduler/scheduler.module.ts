import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AutomationModule } from '../automation/automation.module';
import { ChecklistModule } from '../checklist/checklist.module';
import { TimesheetModule } from '../timesheet/timesheet.module';
import { NotificationModule } from '../notification/notification.module';
import { AppConfigModule } from '../config/config.module';
import { AutoApproveSchedulerService } from './services/auto-approve-scheduler.service';
import { ChecklistSchedulerService } from './services/checklist-scheduler.service';
import { TimesheetSchedulerService } from './services/timesheet-scheduler.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    AutomationModule,
    ChecklistModule,
    TimesheetModule,
    NotificationModule,
    AppConfigModule,
  ],
  providers: [
    AutoApproveSchedulerService,
    ChecklistSchedulerService,
    TimesheetSchedulerService,
  ],
  exports: [],
})
export class SchedulerModule {}
