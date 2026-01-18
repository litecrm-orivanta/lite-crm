import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async list(params: {
    workspaceId?: string | null;
    from?: Date;
    to?: Date;
    action?: string;
    resource?: string;
    actor?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 200);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.workspaceId) {
      where.workspaceId = params.workspaceId;
    }

    if (params.from || params.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = params.from;
      if (params.to) where.createdAt.lte = params.to;
    }

    if (params.action) {
      where.action = { contains: params.action, mode: 'insensitive' };
    }

    if (params.resource) {
      where.resource = { contains: params.resource, mode: 'insensitive' };
    }

    if (params.actor) {
      where.actor = {
        OR: [
          { email: { contains: params.actor, mode: 'insensitive' } },
          { name: { contains: params.actor, mode: 'insensitive' } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listSessions(params: {
    workspaceId?: string | null;
    from?: Date;
    to?: Date;
    actor?: string;
  }) {
    const where: any = {
      action: {
        in: ['session.start', 'session.heartbeat', 'session.end'],
      },
    };

    if (params.workspaceId) {
      where.workspaceId = params.workspaceId;
    }

    if (params.from || params.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = params.from;
      if (params.to) where.createdAt.lte = params.to;
    }

    if (params.actor) {
      where.actor = {
        OR: [
          { email: { contains: params.actor, mode: 'insensitive' } },
          { name: { contains: params.actor, mode: 'insensitive' } },
        ],
      };
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    type SessionAgg = {
      sessionId: string;
      actor: any;
      startAt?: Date;
      endAt?: Date;
      lastActivityAt?: Date;
      heartbeats: number;
    };

    const sessions = new Map<string, SessionAgg>();

    for (const log of logs) {
      const sessionId = (log.metadata as any)?.sessionId;
      if (!sessionId) continue;

      const existing: SessionAgg = sessions.get(sessionId) || {
        sessionId,
        actor: log.actor,
        heartbeats: 0,
      };

      if (log.action === 'session.start') {
        existing.startAt = log.createdAt;
      } else if (log.action === 'session.end') {
        existing.endAt = log.createdAt;
      } else if (log.action === 'session.heartbeat') {
        existing.heartbeats += 1;
        existing.lastActivityAt = log.createdAt;
      }

      if (!existing.lastActivityAt || log.createdAt > existing.lastActivityAt) {
        existing.lastActivityAt = log.createdAt;
      }

      sessions.set(sessionId, existing);
    }

    const result = Array.from(sessions.values()).map((session) => {
      const start = session.startAt;
      const end = session.endAt || session.lastActivityAt;
      const durationMs = start && end ? end.getTime() - start.getTime() : 0;
      return {
        sessionId: session.sessionId,
        actor: session.actor,
        startAt: session.startAt,
        endAt: session.endAt,
        lastActivityAt: session.lastActivityAt,
        durationSeconds: Math.max(0, Math.floor(durationMs / 1000)),
        activeMinutes: session.heartbeats,
      };
    });

    result.sort((a, b) => {
      const aTime = a.startAt ? new Date(a.startAt).getTime() : 0;
      const bTime = b.startAt ? new Date(b.startAt).getTime() : 0;
      return bTime - aTime;
    });

    return result;
  }

  async log(params: {
    actorId?: string | null;
    action: string;
    resource: string;
    resourceId?: string | null;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    workspaceId?: string | null;
  }) {
    await this.prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId || null,
        metadata: params.metadata ?? undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        workspaceId: params.workspaceId || null,
      },
    });
  }
}
