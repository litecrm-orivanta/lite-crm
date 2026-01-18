import { Body, Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LeadNotesService } from './lead-notes.service';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Controller('leads/:id/notes')
@UseGuards(JwtAuthGuard)
export class LeadNotesController {
  constructor(
    private notes: LeadNotesService,
    private audit: AuditService,
  ) {}

  private getRequestMeta(req: Request) {
    const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
    return {
      ipAddress: forwarded || req.ip,
      userAgent: req.headers['user-agent'],
    };
  }

  @Get()
  list(
    @Param('id') leadId: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.notes.list(leadId, user.workspaceId);
  }

  @Post()
  create(
    @Param('id') leadId: string,
    @Req() req: Request,
    @CurrentUser() user: { userId: string; workspaceId: string; role: string },
    @Body() body: { content: string },
  ) {
    const result = this.notes.create(
      leadId,
      user.workspaceId,
      user.userId,
      body.content,
    );
    this.audit.log({
      actorId: user.userId,
      action: 'lead.note_added',
      resource: 'lead_note',
      resourceId: leadId,
      workspaceId: user.workspaceId,
      metadata: { contentLength: body.content?.length || 0, role: user.role },
      ...this.getRequestMeta(req),
    }).catch(() => {});
    return result;
  }
}
