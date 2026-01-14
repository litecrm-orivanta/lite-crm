import { Body, Controller, Delete, Get, Param, Post, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SavedFiltersService } from './saved-filters.service';

@Controller('saved-filters')
@UseGuards(JwtAuthGuard)
export class SavedFiltersController {
  constructor(private service: SavedFiltersService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Body() body: { name: string; filters: any },
  ) {
    return this.service.create(user.userId, user.workspaceId, body.name, body.filters);
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
    @Body() body: { name?: string; filters?: any },
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
