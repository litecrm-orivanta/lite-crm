import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Only super-admins can access platform-wide admin dashboard
    if (!user.isSuperAdmin) {
      throw new ForbiddenException('Super admin access required. Only super-admins can view platform-wide data.');
    }

    return true;
  }
}
