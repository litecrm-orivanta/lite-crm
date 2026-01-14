import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadStage } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(workspaceId: string) {
    const [
      totalLeads,
      leadsByStage,
      leadsBySource,
      leadsByRegion,
      recentLeads,
      conversionRate,
      avgTimeInStage,
    ] = await Promise.all([
      this.prisma.lead.count({ where: { workspaceId } }),
      this.prisma.lead.groupBy({
        by: ['stage'],
        where: { workspaceId },
        _count: { stage: true },
      }),
      this.prisma.lead.groupBy({
        by: ['source'],
        where: { workspaceId, source: { not: null } },
        _count: { source: true },
      }),
      this.prisma.lead.groupBy({
        by: ['region'],
        where: { workspaceId, region: { not: null } },
        _count: { region: true },
      }),
      this.prisma.lead.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          owner: {
            select: { name: true, email: true },
          },
        },
      }),
      this.getConversionRate(workspaceId),
      this.getAvgTimeInStage(workspaceId),
    ]);

    return {
      overview: {
        totalLeads,
        conversionRate,
        avgTimeInStage,
      },
      leadsByStage: leadsByStage.map(item => ({
        stage: item.stage,
        count: item._count.stage,
      })),
      leadsBySource: leadsBySource.map(item => ({
        source: item.source,
        count: item._count.source,
      })),
      leadsByRegion: leadsByRegion.map(item => ({
        region: item.region,
        count: item._count.region,
      })),
      recentLeads,
    };
  }

  private async getConversionRate(workspaceId: string): Promise<number> {
    const total = await this.prisma.lead.count({ where: { workspaceId } });
    const won = await this.prisma.lead.count({
      where: { workspaceId, stage: LeadStage.WON },
    });

    if (total === 0) return 0;
    return (won / total) * 100;
  }

  private async getAvgTimeInStage(workspaceId: string): Promise<number> {
    // This is a simplified calculation
    // In production, you'd track stage change timestamps
    const leads = await this.prisma.lead.findMany({
      where: { workspaceId },
      select: { createdAt: true, stage: true },
    });

    if (leads.length === 0) return 0;

    const now = new Date();
    const totalDays = leads.reduce((sum, lead) => {
      const days = (now.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);

    return totalDays / leads.length;
  }

  async getPipelineMetrics(workspaceId: string) {
    const stages = Object.values(LeadStage);
    const metrics = await Promise.all(
      stages.map(async (stage) => {
        const count = await this.prisma.lead.count({
          where: { workspaceId, stage },
        });
        return { stage, count };
      }),
    );

    return metrics;
  }

  async getActivityTrends(workspaceId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.prisma.activity.findMany({
      where: {
        lead: { workspaceId },
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const trends: Record<string, number> = {};
    activities.forEach((activity) => {
      const date = activity.createdAt.toISOString().split('T')[0];
      trends[date] = (trends[date] || 0) + 1;
    });

    return Object.entries(trends).map(([date, count]) => ({ date, count }));
  }

  async getUserPerformance(workspaceId: string) {
    const users = await this.prisma.user.findMany({
      where: { workspaceId },
      include: {
        leads: {
          select: {
            stage: true,
            createdAt: true,
          },
        },
      },
    });

    return users.map((user) => {
      const totalLeads = user.leads.length;
      const wonLeads = user.leads.filter((l) => l.stage === LeadStage.WON).length;
      const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        totalLeads,
        wonLeads,
        conversionRate,
      };
    });
  }
}
