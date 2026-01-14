import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SavedFiltersService } from './saved-filters.service';
import { SavedFiltersController } from './saved-filters.controller';

@Module({
  imports: [PrismaModule],
  providers: [SavedFiltersService],
  controllers: [SavedFiltersController],
  exports: [SavedFiltersService],
})
export class SavedFiltersModule {}
