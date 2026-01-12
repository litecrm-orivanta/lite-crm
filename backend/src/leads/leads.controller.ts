import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
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
}
