import { Module } from '@nestjs/common';
import { ApiModule } from '../api/api.module';
import { TimesheetController } from './timesheet.controller';
import { TimesheetService } from './timesheet.service';

@Module({
  imports: [ApiModule],
  controllers: [TimesheetController],
  providers: [TimesheetService],
  exports: [TimesheetService],
})
export class TimesheetModule {}
