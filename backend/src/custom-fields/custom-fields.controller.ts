import { Body, Controller, Delete, Get, Param, Post, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CustomFieldsService } from './custom-fields.service';

@Controller('custom-fields')
@UseGuards(JwtAuthGuard)
export class CustomFieldsController {
  constructor(private service: CustomFieldsService) {}

  @Post()
  create(
    @CurrentUser() user: { workspaceId: string },
    @Body() body: { name: string; type: string; options?: any; required?: boolean },
  ) {
    return this.service.create(user.workspaceId, body);
  }

  @Get()
  findAll(@CurrentUser() user: { workspaceId: string }) {
    return this.service.findAll(user.workspaceId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.service.findOne(id, user.workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string },
    @Body() body: { name?: string; type?: string; options?: any; required?: boolean },
  ) {
    return this.service.update(id, user.workspaceId, body);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.service.delete(id, user.workspaceId);
  }

  @Get('leads/:leadId/values')
  getLeadValues(
    @Param('leadId') leadId: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.service.getLeadValues(leadId, user.workspaceId);
  }

  @Post('leads/:leadId/values/:customFieldId')
  setLeadValue(
    @Param('leadId') leadId: string,
    @Param('customFieldId') customFieldId: string,
    @CurrentUser() user: { workspaceId: string },
    @Body() body: { value: any },
  ) {
    return this.service.setLeadValue(leadId, user.workspaceId, customFieldId, body.value);
  }
}
