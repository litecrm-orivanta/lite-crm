import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const strategyOptions: any = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    };

    if (process.env.JWT_ISSUER) {
      strategyOptions.issuer = process.env.JWT_ISSUER;
    }
    if (process.env.JWT_AUDIENCE) {
      strategyOptions.audience = process.env.JWT_AUDIENCE;
    }

    super(strategyOptions);
  }

  async validate(payload: { sub: string; email?: string; role?: string; workspaceId?: string; isSuperAdmin?: boolean }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, workspaceId: true, role: true, email: true, isSuperAdmin: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      userId: user.id,
      workspaceId: user.workspaceId,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin || false,
    };
  }
}
