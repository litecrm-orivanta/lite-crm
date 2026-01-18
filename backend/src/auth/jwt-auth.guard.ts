import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, validate JWT token
    const isValid = await super.canActivate(context);
    if (!isValid) {
      return false;
    }

    // After JWT validation, check workspace suspension status
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.workspaceId && !user.isSuperAdmin) {
      // Check subscription status
      const subscription = await this.prisma.subscription.findUnique({
        where: { workspaceId: user.workspaceId },
        select: { status: true },
      });

      if (subscription && subscription.status === SubscriptionStatus.SUSPENDED) {
        throw new ForbiddenException({
          statusCode: 403,
          message: 'Your account has been suspended. Please contact the administrator or support team to resolve this issue.',
          error: 'Forbidden',
          code: 'WORKSPACE_SUSPENDED',
        });
      }
    }

    return true;
  }
}
