import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChecklistApiService } from './services/ksystem/checklist-api.service';
import { KsystemService } from './services/ksystem.service';
import { HRMService } from './services/hrm.service';
import { TimesheetApiService } from './services/hrm/timesheet-api.service';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';

@Module({
  imports: [HttpModule, AppConfigModule],
  providers: [
    KsystemService,
    ChecklistApiService,
    HRMService,
    TimesheetApiService,
    {
      provide: 'APP_CONFIG',
      useFactory: (configService: AppConfigService) =>
        configService.getConfig(),
      inject: [AppConfigService],
    },
  ],
  exports: [KsystemService, ChecklistApiService, HRMService, TimesheetApiService],
})
export class ApiModule {}
