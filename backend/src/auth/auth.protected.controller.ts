import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';

@Controller('me')
export class MeController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getMe(@CurrentUser() user: { userId: string; workspaceId: string }) {
    return { userId: user.userId };
  }

  @UseGuards(JwtAuthGuard)

  @UseGuards(JwtAuthGuard)
  @Get('workspace')
  async getWorkspace(@CurrentUser() user: { userId: string; workspaceId: string }) {
    return this.authService.getWorkspaceInfo(user.workspaceId);
  }
}
