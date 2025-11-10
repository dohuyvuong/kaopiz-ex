import { Module } from '@nestjs/common';
import { ApiModule } from '../api/api.module';
import { ChecklistAutoReviewService } from './checklist-auto-review.service';
import { ChecklistController } from './checklist.controller';

@Module({
  imports: [ApiModule],
  controllers: [ChecklistController],
  providers: [ChecklistAutoReviewService],
  exports: [ChecklistAutoReviewService],
})
export class ChecklistModule {}
