import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ActivitiesController],
  providers: [PrismaService],
})
export class ActivitiesModule {}
