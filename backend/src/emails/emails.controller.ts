import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EmailsService } from './emails.service';

@Controller('emails')
@UseGuards(JwtAuthGuard)
export class EmailsController {
  constructor(private service: EmailsService) {}

  @Post('send')
  sendEmail(
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Body() body: {
      to: string;
      subject: string;
      body: string;
      leadId?: string;
      templateId?: string;
    },
  ) {
    return this.service.sendEmail(user.userId, user.workspaceId, body);
  }

  @Get('leads/:leadId')
  getEmailsForLead(
    @Param('leadId') leadId: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.service.getEmailsForLead(leadId, user.workspaceId);
  }

  @Get('history')
  getUserEmails(
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Query('limit') limit?: string,
  ) {
    return this.service.getUserEmails(
      user.userId,
      user.workspaceId,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
