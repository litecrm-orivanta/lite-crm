import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private leads: LeadsService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Body() dto: CreateLeadDto,
  ) {
    return this.leads.create(user.userId, user.workspaceId, dto);
  }

  @Get()
  list(@CurrentUser() user: { workspaceId: string }) {
    return this.leads.findAll(user.workspaceId);
  }

  // Phase 1: Export to CSV (must come before @Get(':id'))
  @Get('export/csv')
  async exportCSV(
    @Res() res: Response,
    @CurrentUser() user: { workspaceId: string },
    @Query('stage') stage?: string,
    @Query('source') source?: string,
    @Query('region') region?: string,
    @Query('search') search?: string,
  ) {
    const csv = await this.leads.exportToCSV(user.workspaceId, {
      stage,
      source,
      region,
      search,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(csv);
  }

  // Phase 2: Kanban board view (must come before @Get(':id'))
  @Get('kanban')
  getKanbanView(@CurrentUser() user: { workspaceId: string }) {
    return this.leads.getKanbanView(user.workspaceId);
  }

  @Get(':id')
  getOne(
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.leads.findOne(id, user.workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string },
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leads.update(id, user.workspaceId, dto);
  }

  @Patch(':id/stage')
  updateStage(
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string },
    @Body() dto: UpdateStageDto,
  ) {
    return this.leads.updateStage(id, user.workspaceId, dto.stage);
  }

  // 🔹 NEW — ASSIGN OWNER
  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @CurrentUser()
    user: { userId: string; workspaceId: string },
    @Body() body: { ownerId: string },
  ) {
    return this.leads.assignOwner(
      id,
      user.workspaceId,
      user.userId,
      body.ownerId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.leads.remove(id, user.workspaceId);
  }

  // Phase 1: Bulk operations
  @Post('bulk/update')
  bulkUpdate(
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Body() body: {
      leadIds: string[];
      updates: {
        stage?: string;
        ownerId?: string;
        source?: string;
        region?: string;
      };
    },
  ) {
    return this.leads.bulkUpdate(user.workspaceId, body.leadIds, body.updates);
  }

  @Post('bulk/delete')
  bulkDelete(
    @CurrentUser() user: { workspaceId: string },
    @Body() body: { leadIds: string[] },
  ) {
    return this.leads.bulkDelete(user.workspaceId, body.leadIds);
  }

  @Post('bulk/assign')
  bulkAssign(
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Body() body: { leadIds: string[]; ownerId: string },
  ) {
    return this.leads.bulkAssign(
      user.workspaceId,
      body.leadIds,
      body.ownerId,
      user.userId,
    );
  }
}
