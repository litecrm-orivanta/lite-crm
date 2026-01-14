import { Body, Controller, Delete, Get, Param, Post, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EmailTemplatesService } from './email-templates.service';

@Controller('email-templates')
@UseGuards(JwtAuthGuard)
export class EmailTemplatesController {
  constructor(private service: EmailTemplatesService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Body() body: { name: string; subject: string; body: string; variables?: any },
  ) {
    return this.service.create(user.userId, user.workspaceId, body);
  }

  @Get()
  findAll(@CurrentUser() user: { userId: string; workspaceId: string }) {
    return this.service.findAll(user.userId, user.workspaceId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; workspaceId: string },
  ) {
    return this.service.findOne(id, user.userId, user.workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Body() body: { name?: string; subject?: string; body?: string; variables?: any },
  ) {
    return this.service.update(id, user.userId, user.workspaceId, body);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; workspaceId: string },
  ) {
    return this.service.delete(id, user.userId, user.workspaceId);
  }
}
