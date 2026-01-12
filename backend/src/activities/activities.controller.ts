import {
  Controller,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType } from '@prisma/client';

type UpdateNoteBody = {
  content: string;
};

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * PATCH /activities/:id
   * Edit a NOTE activity
   */
  @Patch(':id')
  async updateNote(
    @Param('id') id: string,
    @Body() body: UpdateNoteBody,
    @CurrentUser() user: { workspaceId: string },
  ) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        lead: { select: { workspaceId: true } },
      },
    });

    if (
      !activity ||
      activity.type !== ActivityType.NOTE ||
      activity.lead.workspaceId !== user.workspaceId
    ) {
      throw new ForbiddenException();
    }

    return this.prisma.activity.update({
      where: { id },
      data: {
        metadata: {
          content: body.content,
        },
      },
    });
  }

  /**
   * DELETE /activities/:id
   * Delete a NOTE activity
   */
  @Delete(':id')
  async deleteNote(
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        lead: { select: { workspaceId: true } },
      },
    });

    if (
      !activity ||
      activity.type !== ActivityType.NOTE ||
      activity.lead.workspaceId !== user.workspaceId
    ) {
      throw new ForbiddenException();
    }

    await this.prisma.activity.delete({
      where: { id },
    });

    return { success: true };
  }
}
