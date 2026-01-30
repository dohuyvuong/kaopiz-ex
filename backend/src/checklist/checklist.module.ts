import { Module } from '@nestjs/common';
import { ApiModule } from '../api/api.module';
import { AuthModule } from '../auth/auth.module';
import { ChecklistAutoReviewService } from './checklist-auto-review.service';
import { ChecklistController } from './checklist.controller';
import { ChecklistService } from './checklist.service';

@Module({
  imports: [ApiModule, AuthModule],
  controllers: [ChecklistController],
  providers: [ChecklistService, ChecklistAutoReviewService],
  exports: [ChecklistService, ChecklistAutoReviewService],
})
export class ChecklistModule {}
