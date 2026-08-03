import { Module } from '@nestjs/common';
import { ApiModule } from '../api/api.module';
import { AuthModule } from '../auth/auth.module';
import { TimesheetController } from './timesheet.controller';
import { TimesheetService } from './timesheet.service';
import { TimesheetSnapshotService } from './timesheet-snapshot.service';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [ApiModule, AuthModule, ApplicationModule],
  controllers: [TimesheetController],
  providers: [TimesheetService, TimesheetSnapshotService],
  exports: [TimesheetService, TimesheetSnapshotService],
})
export class TimesheetModule {}
