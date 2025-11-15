import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { ApiModule } from './api/api.module';
import { ChecklistModule } from './checklist/checklist.module';
import { TimesheetModule } from './timesheet/timesheet.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
    ApiModule,
    ChecklistModule,
    TimesheetModule,
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
