import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChecklistService } from './services/checklist.service';
import { BaseKaopizService } from './services/base-kaopiz.service';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';

@Module({
  imports: [HttpModule, AppConfigModule],
  providers: [
    BaseKaopizService,
    ChecklistService,
    {
      provide: 'APP_CONFIG',
      useFactory: (configService: AppConfigService) =>
        configService.getConfig(),
      inject: [AppConfigService],
    },
  ],
  exports: [BaseKaopizService, ChecklistService],
})
export class ApiModule {}
