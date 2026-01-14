import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedFiltersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, workspaceId: string, name: string, filters: any) {
    return this.prisma.savedFilter.create({
      data: {
        name,
        filters,
        userId,
        workspaceId,
      },
    });
  }

  async findAll(userId: string, workspaceId: string) {
    return this.prisma.savedFilter.findMany({
      where: {
        userId,
        workspaceId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, workspaceId: string) {
    const filter = await this.prisma.savedFilter.findUnique({
      where: { id },
    });

    if (!filter || filter.workspaceId !== workspaceId || filter.userId !== userId) {
      throw new NotFoundException('Filter not found');
    }

    return filter;
  }

  async update(id: string, userId: string, workspaceId: string, updates: {
    name?: string;
    filters?: any;
  }) {
    const filter = await this.findOne(id, userId, workspaceId);

    return this.prisma.savedFilter.update({
      where: { id },
      data: updates,
    });
  }

  async delete(id: string, userId: string, workspaceId: string) {
    await this.findOne(id, userId, workspaceId);
    return this.prisma.savedFilter.delete({
      where: { id },
    });
  }
}
