import { Module } from '@nestjs/common';
import { ApiModule } from '../api/api.module';
import { AuthModule } from '../auth/auth.module';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApproverPreferenceService } from './approver-preference.service';

@Module({
  imports: [ApiModule, AuthModule],
  controllers: [ApplicationController],
  providers: [ApplicationService, ApproverPreferenceService],
  exports: [ApplicationService, ApproverPreferenceService],
})
export class ApplicationModule {}
