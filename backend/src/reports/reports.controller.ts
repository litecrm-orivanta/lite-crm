import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('analytics')
  getAnalytics(@CurrentUser() user: { workspaceId: string }) {
    return this.service.getAnalytics(user.workspaceId);
  }

  @Get('pipeline')
  getPipelineMetrics(@CurrentUser() user: { workspaceId: string }) {
    return this.service.getPipelineMetrics(user.workspaceId);
  }

  @Get('activity-trends')
  getActivityTrends(
    @CurrentUser() user: { workspaceId: string },
    @Query('days') days?: string,
  ) {
    return this.service.getActivityTrends(
      user.workspaceId,
      days ? parseInt(days, 10) : 30,
    );
  }

  @Get('user-performance')
  getUserPerformance(@CurrentUser() user: { workspaceId: string }) {
    return this.service.getUserPerformance(user.workspaceId);
  }
}
