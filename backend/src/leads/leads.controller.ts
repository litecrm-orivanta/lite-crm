import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LeadsService } from './leads.service';
import { BulkImportService } from './bulk-import.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(
    private leads: LeadsService,
    private bulkImport: BulkImportService,
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  private getRequestMeta(req: Request) {
    const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
    return {
      ipAddress: forwarded || req.ip,
      userAgent: req.headers['user-agent'],
    };
  }

  @Post()
  async create(
    @Req() req: Request,
    @CurrentUser() user: { userId: string; workspaceId: string; role: string },
    @Body() dto: CreateLeadDto,
  ) {
    const result = await this.leads.create(user.userId, user.workspaceId, dto);
    await this.audit.log({
      actorId: user.userId,
      action: 'lead.create',
      resource: 'lead',
      resourceId: result.id,
      workspaceId: user.workspaceId,
      metadata: { after: result, role: user.role },
      ...this.getRequestMeta(req),
    });
    return result;
  }

  @Get()
  list(
    @CurrentUser() user: { workspaceId: string },
    @Query('stage') stage?: string,
    @Query('source') source?: string,
    @Query('region') region?: string,
    @Query('search') search?: string,
  ) {
    return this.leads.findAll(user.workspaceId, {
      stage,
      source,
      region,
      search,
    });
  }

  // Phase 1: Export to CSV (must come before @Get(':id'))
  @Get('export/csv')
  async exportCSV(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: { workspaceId: string; userId: string; role: string },
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

    await this.audit.log({
      actorId: user.userId,
      action: 'lead.export_csv',
      resource: 'lead',
      workspaceId: user.workspaceId,
      metadata: { filters: { stage, source, region, search }, role: user.role },
      ...this.getRequestMeta(req),
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

  // Bulk Import endpoints (must come before @Get(':id') to avoid route conflicts)
  @Post('bulk-import/preview')
  async previewImport(
    @CurrentUser() user: { workspaceId: string },
    @Body() body: { csvData: string },
  ) {
    return this.bulkImport.previewCSV(body.csvData);
  }

  @Post('bulk-import/csv')
  async importFromCSV(
    @Req() req: Request,
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Body()
    body: {
      csvData: string;
      columnMapping: Record<string, string>;
    },
  ) {
    const result = await this.bulkImport.importFromCSV(
      user.workspaceId,
      user.userId,
      body.csvData,
      body.columnMapping,
    );
    await this.audit.log({
      actorId: user.userId,
      action: 'lead.bulk_import_csv',
      resource: 'lead',
      workspaceId: user.workspaceId,
      metadata: { result },
      ...this.getRequestMeta(req),
    });
    return result;
  }

  @Post('bulk-import/google-sheets')
  async importFromGoogleSheets(
    @Req() req: Request,
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Body()
    body: {
      sheetData: any[];
      columnMapping: Record<string, string>;
    },
  ) {
    const result = await this.bulkImport.importFromGoogleSheets(
      user.workspaceId,
      user.userId,
      body.sheetData,
      body.columnMapping,
    );
    await this.audit.log({
      actorId: user.userId,
      action: 'lead.bulk_import_google_sheets',
      resource: 'lead',
      workspaceId: user.workspaceId,
      metadata: { result },
      ...this.getRequestMeta(req),
    });
    return result;
  }

  @Get(':id')
  getOne(
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.leads.findOne(id, user.workspaceId);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string; userId: string; role: string },
    @Body() dto: UpdateLeadDto,
  ) {
    const before = await this.prisma.lead.findFirst({ where: { id, workspaceId: user.workspaceId } });
    const result = await this.leads.update(id, user.workspaceId, dto);
    await this.audit.log({
      actorId: user.userId,
      action: 'lead.update',
      resource: 'lead',
      resourceId: id,
      workspaceId: user.workspaceId,
      metadata: { before, after: result, role: user.role },
      ...this.getRequestMeta(req),
    });
    return result;
  }

  @Patch(':id/stage')
  async updateStage(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string; userId: string; role: string },
    @Body() dto: UpdateStageDto,
  ) {
    const before = await this.prisma.lead.findFirst({ where: { id, workspaceId: user.workspaceId } });
    const result = await this.leads.updateStage(id, user.workspaceId, dto.stage);
    await this.audit.log({
      actorId: user.userId,
      action: 'lead.stage_change',
      resource: 'lead',
      resourceId: id,
      workspaceId: user.workspaceId,
      metadata: { before, after: result, role: user.role },
      ...this.getRequestMeta(req),
    });
    return result;
  }

  // 🔹 NEW — ASSIGN OWNER
  @Patch(':id/assign')
  async assign(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser()
    user: { userId: string; workspaceId: string; role: string },
    @Body() body: { ownerId: string },
  ) {
    const before = await this.prisma.lead.findFirst({ where: { id, workspaceId: user.workspaceId } });
    const result = await this.leads.assignOwner(
      id,
      user.workspaceId,
      user.userId,
      body.ownerId,
    );
    await this.audit.log({
      actorId: user.userId,
      action: 'lead.owner_change',
      resource: 'lead',
      resourceId: id,
      workspaceId: user.workspaceId,
      metadata: { before, after: result, role: user.role },
      ...this.getRequestMeta(req),
    });
    return result;
  }

  @Delete(':id')
  async remove(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string; userId: string; role: string },
  ) {
    const before = await this.prisma.lead.findFirst({ where: { id, workspaceId: user.workspaceId } });
    const result = await this.leads.remove(id, user.workspaceId);
    await this.audit.log({
      actorId: user.userId,
      action: 'lead.delete',
      resource: 'lead',
      resourceId: id,
      workspaceId: user.workspaceId,
      metadata: { before, role: user.role },
      ...this.getRequestMeta(req),
    });
    return result;
  }

  // Phase 1: Bulk operations
  @Post('bulk/update')
  async bulkUpdate(
    @Req() req: Request,
    @CurrentUser() user: { userId: string; workspaceId: string; role: string },
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
    const result = await this.leads.bulkUpdate(user.workspaceId, body.leadIds, body.updates);
    await this.audit.log({
      actorId: user.userId,
      action: 'lead.bulk_update',
      resource: 'lead',
      workspaceId: user.workspaceId,
      metadata: { leadIds: body.leadIds, updates: body.updates, role: user.role },
      ...this.getRequestMeta(req),
    });
    return result;
  }

  @Post('bulk/delete')
  async bulkDelete(
    @Req() req: Request,
    @CurrentUser() user: { workspaceId: string; userId: string; role: string },
    @Body() body: { leadIds: string[] },
  ) {
    const result = await this.leads.bulkDelete(user.workspaceId, body.leadIds);
    await this.audit.log({
      actorId: user.userId,
      action: 'lead.bulk_delete',
      resource: 'lead',
      workspaceId: user.workspaceId,
      metadata: { leadIds: body.leadIds, role: user.role },
      ...this.getRequestMeta(req),
    });
    return result;
  }

  @Post('bulk/assign')
  async bulkAssign(
    @Req() req: Request,
    @CurrentUser() user: { userId: string; workspaceId: string; role: string },
    @Body() body: { leadIds: string[]; ownerId: string },
  ) {
    const result = await this.leads.bulkAssign(
      user.workspaceId,
      body.leadIds,
      body.ownerId,
      user.userId,
    );
    await this.audit.log({
      actorId: user.userId,
      action: 'lead.bulk_assign',
      resource: 'lead',
      workspaceId: user.workspaceId,
      metadata: { leadIds: body.leadIds, ownerId: body.ownerId, role: user.role },
      ...this.getRequestMeta(req),
    });
    return result;
  }
}
