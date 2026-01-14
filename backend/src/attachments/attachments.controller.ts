import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AttachmentsService } from './attachments.service';

@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private service: AttachmentsService) {}

  @Post('leads/:leadId')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Param('leadId') leadId: string,
    @CurrentUser() user: { userId: string; workspaceId: string },
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new Error('File is required');
    }
    return this.service.create(user.userId, user.workspaceId, leadId, file);
  }

  @Get('leads/:leadId')
  findAll(
    @Param('leadId') leadId: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.service.findAll(leadId, user.workspaceId);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.service.delete(id, user.workspaceId);
  }
}
