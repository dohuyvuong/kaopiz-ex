import { Module } from '@nestjs/common';
import { ApiModule } from '../api/api.module';
import { AuthModule } from '../auth/auth.module';
import { TimesheetController } from './timesheet.controller';
import { TimesheetService } from './timesheet.service';

@Module({
  imports: [ApiModule, AuthModule],
  controllers: [TimesheetController],
  providers: [TimesheetService],
  exports: [TimesheetService],
})
export class TimesheetModule {}
