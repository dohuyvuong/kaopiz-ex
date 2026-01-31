import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ApiModule } from './api/api.module';
import { ChecklistModule } from './checklist/checklist.module';
import { TimesheetModule } from './timesheet/timesheet.module';
import { ApplicationModule } from './application/application.module';
import { AutomationModule } from './automation/automation.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AppConfigModule,
    PrismaModule,
    AuthModule,
    ApiModule,
    ChecklistModule,
    TimesheetModule,
    ApplicationModule,
    AutomationModule,
    SchedulerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    },
  ],
})
export class AppModule {}
