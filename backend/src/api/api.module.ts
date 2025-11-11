import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChecklistService } from './services/checklist.service';
import { KsystemService } from './services/ksystem.service';
import { HRMService } from './services/hrm.service';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';

@Module({
  imports: [HttpModule, AppConfigModule],
  providers: [
    KsystemService,
    ChecklistService,
    HRMService,
    {
      provide: 'APP_CONFIG',
      useFactory: (configService: AppConfigService) =>
        configService.getConfig(),
      inject: [AppConfigService],
    },
  ],
  exports: [KsystemService, ChecklistService, HRMService],
})
export class ApiModule {}
