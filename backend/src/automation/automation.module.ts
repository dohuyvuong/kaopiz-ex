import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AppConfigModule } from '../config/config.module';
import { ChecklistModule } from '../checklist/checklist.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AppConfigModule,
    JwtModule.register({}), // Register JwtModule for AppJwtGuard
    forwardRef(() => ChecklistModule), // Avoid circular dependency
    forwardRef(() => ApplicationModule), // Avoid circular dependency
  ],
  controllers: [AutomationController],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}
