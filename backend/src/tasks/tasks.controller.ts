import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';

type CreateTaskBody = {
  dueAt: string;
  title: string;
  note?: string;
};

type UpdateTaskBody = {
  dueAt?: string;
  title?: string;
  note?: string;
};

@UseGuards(JwtAuthGuard)
@Controller('leads/:leadId/tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  /**
   * GET /leads/:leadId/tasks
   */
  @Get()
  list(
    @Param('leadId') leadId: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.tasks.listForLead(leadId, user.workspaceId);
  }

  /**
   * POST /leads/:leadId/tasks
   */
  @Post()
  create(
    @Param('leadId') leadId: string,
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Body() body: CreateTaskBody,
  ) {
    return this.tasks.create(
      leadId,
      user.workspaceId,
      user.userId,
      new Date(body.dueAt),
      body.title,
      body.note,
    );
  }

  /**
   * PATCH /leads/:leadId/tasks/:taskId
   * Edit task (title / note / dueAt)
   */
  @Patch(':taskId')
  update(
    @Param('taskId') taskId: string,
    @Param('leadId') leadId: string,
    @CurrentUser() user: { workspaceId: string },
    @Body() body: UpdateTaskBody,
  ) {
    return this.tasks.update(
      taskId,
      leadId,
      user.workspaceId,
      body,
    );
  }

  /**
   * PATCH /leads/:leadId/tasks/:taskId/complete
   */
  @Patch(':taskId/complete')
  complete(
    @Param('taskId') taskId: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.tasks.markComplete(taskId, user.workspaceId);
  }

  /**
   * DELETE /leads/:leadId/tasks/:taskId
   */
  @Delete(':taskId')
  remove(
    @Param('taskId') taskId: string,
    @Param('leadId') leadId: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.tasks.remove(
      taskId,
      leadId,
      user.workspaceId,
    );
  }
}
