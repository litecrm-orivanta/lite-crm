import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditRetentionService {
  private readonly logger = new Logger(AuditRetentionService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('0 2 * * *')
  async cleanupOldLogs() {
    const retentionDays = parseInt(process.env.AUDIT_RETENTION_DAYS || '180', 10);
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const result = await this.prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    this.logger.log(`Audit log cleanup deleted ${result.count} entries`);
  }
}
