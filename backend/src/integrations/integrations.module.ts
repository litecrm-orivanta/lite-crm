import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { EmailIntegrationService } from './email-integration.service';
import { EmailIntegrationController } from './email-integration.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../notifications/mail.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, MailModule, AuditModule],
  providers: [IntegrationsService, EmailIntegrationService],
  controllers: [IntegrationsController, EmailIntegrationController],
  exports: [IntegrationsService, EmailIntegrationService],
})
export class IntegrationsModule {}
