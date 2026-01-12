import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LeadNotesService } from './lead-notes.service';

@Controller('leads/:id/notes')
@UseGuards(JwtAuthGuard)
export class LeadNotesController {
  constructor(private notes: LeadNotesService) {}

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
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Body() body: { content: string },
  ) {
    return this.notes.create(
      leadId,
      user.workspaceId,
      user.userId,
      body.content,
    );
  }
}
