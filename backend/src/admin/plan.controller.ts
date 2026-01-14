import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PlanService } from './plan.service';

@Controller('plan')
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private planService: PlanService) {}

  /**
   * Get usage statistics for current workspace
   */
  @Get('usage')
  async getUsageStats(@CurrentUser() user: { workspaceId: string }) {
    return this.planService.getUsageStats(user.workspaceId);
  }
}
